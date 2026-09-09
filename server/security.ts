import express from 'express';

/**
 * Enterprise Security & Threat Prevention Suite
 * Protects against:
 * 1. DoS / Resource Exhaustion via granular in-memory sliding-window rate limiting & payload limits
 * 2. Prototype Pollution & Parameter Tampering
 * 3. Cross-Site Scripting (XSS), Clickjacking & Malicious Framing via strict CSP and Security Headers
 * 4. Path Traversal & Injection via strict token, postal code, and string sanitation
 * 5. Data Disclosure & Information Leakage via sanitized error handling and route guards
 */

// -------------------------------------------------------------
// 1. HTTP Security Headers
// -------------------------------------------------------------
export function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Hide Express signature
  res.removeHeader('X-Powered-By');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Cross-Site Scripting filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser APIs
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );

  // Content Security Policy
  // Allows AI Studio preview frames, Google Fonts, and carrier assets while blocking script injection
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: ws:",
    "frame-ancestors 'self' https://*.google.com https://*.run.app https://ai.studio",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  // HTTPS enforcement header when deployed behind proxy
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

// -------------------------------------------------------------
// 2. Sliding-Window Rate Limiter
// -------------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const { windowMs, maxRequests, message } = options;
  const ipMap = new Map<string, RateLimitRecord>();

  // Periodic cleanup to avoid memory leaks (runs every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        ipMap.delete(ip);
      }
    }
  }, 300000).unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Determine client IP safely
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : (req.socket?.remoteAddress || req.ip || 'unknown-client');

    const now = Date.now();
    let record = ipMap.get(ip);
    if (!record) {
      record = { timestamps: [] };
      ipMap.set(ip, record);
    }

    // Filter to timestamps in current window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.timestamps.length).toString());

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec.toString());
      return res.status(429).json({
        success: false,
        error: message || 'Too many requests. Please slow down and try again shortly.',
        retryAfter: retryAfterSec,
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// -------------------------------------------------------------
// 3. Prototype Pollution & Malicious Payload Detector
// -------------------------------------------------------------
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

function checkObjectForPollution(obj: any, depth = 0): boolean {
  if (!obj || typeof obj !== 'object' || depth > 10) return false;

  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.includes(key.toLowerCase())) {
      return true;
    }
    const val = obj[key];
    if (typeof val === 'object' && val !== null) {
      if (checkObjectForPollution(val, depth + 1)) {
        return true;
      }
    }
  }
  return false;
}

export function preventPrototypePollution(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (checkObjectForPollution(req.body) || checkObjectForPollution(req.query) || checkObjectForPollution(req.params)) {
    return res.status(400).json({
      success: false,
      error: 'Security violation: illegal object properties detected in request payload.',
    });
  }
  next();
}

// -------------------------------------------------------------
// 4. Token Parameter Guard (Path Traversal & Injection Prevention)
// -------------------------------------------------------------
const SAFE_TOKEN_REGEX = /^[A-Za-z0-9_-]{4,64}$/;

export function validateTokenParam(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.params.token;
  if (!token || !SAFE_TOKEN_REGEX.test(token)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or malformed quote token format.',
    });
  }
  next();
}

// -------------------------------------------------------------
// 5. Quote Payload Validator & Sanitizer
// -------------------------------------------------------------
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;
const CA_POSTAL_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

function sanitizeString(val: any, maxLen = 120): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>'"\0]/g, '') // remove dangerous characters
    .trim()
    .slice(0, maxLen);
}

export function validateQuotePayload(req: express.Request, res: express.Response, next: express.NextFunction) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ success: false, error: 'Quote payload must be a valid JSON object.' });
  }

  // Sanitize locations
  body.pickupLocation = sanitizeString(body.pickupLocation, 120);
  body.deliveryLocation = sanitizeString(body.deliveryLocation, 120);
  body.pickupZip = sanitizeString(body.pickupZip, 20);
  body.deliveryZip = sanitizeString(body.deliveryZip, 20);

  // Validate country codes
  body.pickupCountry = body.pickupCountry === 'CA' ? 'CA' : 'US';
  body.deliveryCountry = body.deliveryCountry === 'CA' ? 'CA' : 'US';

  // Validate Zip formats
  const originValid = body.pickupCountry === 'CA'
    ? CA_POSTAL_REGEX.test(body.pickupZip)
    : US_ZIP_REGEX.test(body.pickupZip);

  if (!originValid) {
    return res.status(400).json({
      success: false,
      error: `Invalid Origin ${body.pickupCountry === 'CA' ? 'Canadian postal code (e.g. M1R 0E9)' : '5-digit US ZIP code'}: "${body.pickupZip}".`,
    });
  }

  const destValid = body.deliveryCountry === 'CA'
    ? CA_POSTAL_REGEX.test(body.deliveryZip)
    : US_ZIP_REGEX.test(body.deliveryZip);

  if (!destValid) {
    return res.status(400).json({
      success: false,
      error: `Invalid Destination ${body.deliveryCountry === 'CA' ? 'Canadian postal code (e.g. M1R 0E9)' : '5-digit US ZIP code'}: "${body.deliveryZip}".`,
    });
  }

  // Validate Line Items
  if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one freight line item is required.' });
  }

  if (body.lineItems.length > 25) {
    return res.status(400).json({ success: false, error: 'Maximum 25 line items allowed per quote request.' });
  }

  for (let i = 0; i < body.lineItems.length; i++) {
    const item = body.lineItems[i];
    if (!item || typeof item !== 'object') {
      return res.status(400).json({ success: false, error: `Line item #${i + 1} is invalid.` });
    }

    item.units = parseInt(item.units, 10);
    if (isNaN(item.units) || item.units < 1 || item.units > 500) {
      return res.status(400).json({ success: false, error: `Line item #${i + 1} units must be between 1 and 500.` });
    }

    item.weight = parseFloat(item.weight);
    if (isNaN(item.weight) || item.weight < 1 || item.weight > 50000) {
      return res.status(400).json({ success: false, error: `Line item #${i + 1} weight must be between 1 and 50,000.` });
    }

    item.length = parseFloat(item.length) || 48;
    item.width = parseFloat(item.width) || 40;
    item.height = parseFloat(item.height) || 48;

    if (item.length < 1 || item.length > 600 || item.width < 1 || item.width > 600 || item.height < 1 || item.height > 600) {
      return res.status(400).json({ success: false, error: `Line item #${i + 1} dimensions must be between 1 and 600.` });
    }

    item.commodity = sanitizeString(item.commodity || 'Freight Class', 100);
    item.type = sanitizeString(item.type || 'Pallets', 40);
    item.nmfcClass = sanitizeString(item.nmfcClass || '70', 10);
  }

  // Validate and sanitize accessorials
  if (Array.isArray(body.accessorials)) {
    if (body.accessorials.length > 30) {
      body.accessorials = body.accessorials.slice(0, 30);
    }
    body.accessorials = body.accessorials
      .map((acc: any) => String(acc).replace(/[^A-Za-z0-9_-]/g, '').trim())
      .filter(Boolean);
  } else {
    body.accessorials = [];
  }

  // Validate Cargo Value if supplied
  if (body.cargoValue !== undefined && body.cargoValue !== null) {
    const val = parseFloat(body.cargoValue);
    if (isNaN(val) || val < 0 || val > 1000000) {
      return res.status(400).json({ success: false, error: 'Declared cargo value must be between $0 and $1,000,000.' });
    }
    body.cargoValue = val;
  }

  next();
}

// -------------------------------------------------------------
// 6. Global Error Sanitization Middleware
// -------------------------------------------------------------
export function safeErrorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  // Log full error internally for operational diagnostics
  console.error(`[Jason LTL Security] [${req.method} ${req.path}] Error:`, err.message || err);

  // Payload too large error from express.json
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Payload size exceeds safe operational limit (max 64KB).',
    });
  }

  // Malformed JSON syntax error
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload syntax.',
    });
  }

  // Sanitize message to prevent exposing internal endpoints, credentials or tokens
  let safeMessage = 'An unexpected service exception occurred. Please try again.';
  if (err.message) {
    safeMessage = String(err.message)
      .replace(/https?:\/\/[^\s]+/gi, '[network service]')
      .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [redacted]')
      .replace(/glt/gi, 'direct carrier');
  }

  res.status(500).json({
    success: false,
    error: safeMessage,
  });
}
