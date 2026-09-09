import express from 'express';
import path from 'path';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';
import { CONFIG } from './server/config.js';
import { gltService } from './server/gltService.js';
import { searchLocations } from './server/locationService.js';
import {
  COMMON_ACCESSORIALS,
  GENERAL_ACCESSORIALS,
  ORIGIN_ACCESSORIALS,
  DELIVERY_ACCESSORIALS,
  NMFC_CLASSES,
  PACKAGE_TYPES,
} from './server/accessorials.js';
import { getQuote, updateQuoteStatus } from './server/quoteStore.js';
import { QuoteRequestPayload } from './src/types.js';
import { sendDispatchBookingEmail } from './server/emailService.js';
import {
  securityHeaders,
  createRateLimiter,
  preventPrototypePollution,
  validateTokenParam,
  validateQuotePayload,
  safeErrorHandler,
} from './server/security.js';

// Catch unhandled process exceptions to avoid service crashes
process.on('unhandledRejection', (reason) => {
  console.error('[Jason LTL Security] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[Jason LTL Security] Uncaught Exception:', error);
});

async function startServer() {
  const app = express();
  const PORT = CONFIG.PORT;

  // -------------------------------------------------------------
  // 1. Security & Hardening Middleware
  // -------------------------------------------------------------
  app.disable('x-powered-by');
  app.use(securityHeaders);

  // Enforce strict JSON body size (prevents memory exhaustion attacks)
  app.use(express.json({ limit: '64kb' }));

  // Prevent Prototype Pollution & Parameter Tampering
  app.use(preventPrototypePollution);

  // Rate limiters
  const globalLimiter = createRateLimiter({
    windowMs: 60000,
    maxRequests: 180,
    message: 'Global rate limit reached. Please wait a moment before sending more requests.',
  });

  const quoteLimiter = createRateLimiter({
    windowMs: 120000,
    maxRequests: 25,
    message: 'Rate calculation limit reached. Please wait a moment before submitting new quote requests.',
  });

  const autocompleteLimiter = createRateLimiter({
    windowMs: 60000,
    maxRequests: 90,
    message: 'Location autocomplete limit reached. Please wait a moment.',
  });

  const authLimiter = createRateLimiter({
    windowMs: 900000, // 15 minutes
    maxRequests: 6,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  });

  const bookingLimiter = createRateLimiter({
    windowMs: 60000,
    maxRequests: 15,
    message: 'Booking request limit reached. Please wait a moment.',
  });

  app.use('/api', globalLimiter);

  // -------------------------------------------------------------
  // 2. API Endpoints
  // -------------------------------------------------------------

  // Health check & System status
  app.get('/api/status', (req, res) => {
    try {
      const status = gltService.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Status check failed.' });
    }
  });

  // Manual or initial re-authentication trigger
  const handleLogin = async (req: express.Request, res: express.Response) => {
    try {
      const result = await gltService.login();
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Session connection failed.' });
    }
  };

  app.post('/api/auth/login', authLimiter, handleLogin);
  app.post('/api/login', authLimiter, handleLogin);
  app.get('/api/auth/login', authLimiter, handleLogin);
  app.get('/api/login', authLimiter, handleLogin);

  // Authenticated Carrier Loads history route (Protected from public unauthorized scraping)
  app.get('/api/loads', async (req, res) => {
    try {
      const adminKey = req.headers['x-admin-key'] || req.query.admin_key;
      const requiredKey = process.env.ADMIN_SECRET || process.env.ADMIN_KEY;

      if (requiredKey && adminKey !== requiredKey) {
        return res.status(403).json({
          success: false,
          error: 'Access restricted: Carrier dispatch order book requires administrator privileges.',
        });
      }

      let session = gltService.getSessionData();
      if (!session?.authToken) {
        await gltService.login();
        session = gltService.getSessionData();
      }
      if (!session?.authToken) {
        return res.status(401).json({ error: 'No active carrier network session available.' });
      }

      const loadsRes = await axios.get(`${CONFIG.GLT_API_URL}/api/loads`, {
        headers: { Authorization: `Bearer ${session.authToken}` },
        timeout: 10000,
      });

      res.json({
        success: true,
        account: session.accountName || 'Jason CYL Ltd',
        loads: loadsRes.data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Unable to retrieve load records.' });
    }
  });

  // Accessorials catalog
  app.get('/api/accessorials', (req, res) => {
    res.json({
      common: COMMON_ACCESSORIALS,
      general: GENERAL_ACCESSORIALS,
      origin: ORIGIN_ACCESSORIALS,
      delivery: DELIVERY_ACCESSORIALS,
      nmfcClasses: NMFC_CLASSES,
      packageTypes: PACKAGE_TYPES,
    });
  });

  // Location autocomplete (zip / city / hub lookup) with Rate Limiting & Input Clamping
  app.get('/api/locations/autocomplete', autocompleteLimiter, async (req, res) => {
    try {
      const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
      const rawCountry = typeof req.query.country === 'string' ? req.query.country : 'US';
      const country = rawCountry.toUpperCase() === 'CA' ? 'CA' : 'US';

      const session = gltService.getSessionData();
      const results = await searchLocations(rawQuery, session?.authToken, country);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'Location lookup failed.' });
    }
  });

  // Submit Freight Quote Request with Rate Limiting, Prototype Protection & Strict Payload Validation
  app.post('/api/quote', quoteLimiter, validateQuotePayload, async (req, res) => {
    // Keep socket alive for up to 180s to comfortably support 120s multi-carrier calculation
    req.setTimeout(180000);
    res.setTimeout(180000);
    try {
      const payload: QuoteRequestPayload = req.body;
      const result = await gltService.submitQuote(payload);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Failed to retrieve quote from carrier network session.',
        });
      }

      res.json({
        success: true,
        quoteToken: result.data?.quoteToken,
        data: result.data,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'An unexpected error occurred during quote execution.',
      });
    }
  });

  // Retrieve Quote by Token (Protected with Token Parameter Guard)
  app.get('/api/quote/:token', validateTokenParam, (req, res) => {
    const { token } = req.params;
    const quote = getQuote(token);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote token "${token}" was not found or has expired.`,
      });
    }
    res.json({ success: true, data: quote });
  });

  // Book shipment with carrier (Protected with Token Guard & Rate Limiter)
  app.post('/api/quote/:token/book', bookingLimiter, validateTokenParam, async (req, res) => {
    try {
      const { token } = req.params;
      const {
        carrierId,
        withInsurance,
        bookerEmail,
        pickupDetails,
        deliveryDetails,
        specialInstructions,
      } = req.body || {};

      if (!carrierId || typeof carrierId !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid carrier identifier is required for booking.' });
      }

      // Validate booker email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanBookerEmail = String(bookerEmail || '').trim();
      if (!cleanBookerEmail || !emailPattern.test(cleanBookerEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid Booker / User Email address for dispatch notification.',
        });
      }

      const quote = getQuote(token);
      if (!quote) {
        return res.status(404).json({ success: false, error: 'Quote not found or expired.' });
      }

      const carrier = quote.carriers.find((c) => c.carrierId === carrierId || c.id === carrierId);
      if (!carrier) {
        return res.status(400).json({ success: false, error: 'Selected carrier not found in quote options.' });
      }

      updateQuoteStatus(token, 'booked');

      const bookingReference = `BOL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const sanitizedPickup = {
        address: String(pickupDetails?.address || '').trim(),
        phone: String(pickupDetails?.phone || '').trim(),
        email: String(pickupDetails?.email || '').trim(),
      };

      const sanitizedDelivery = {
        address: String(deliveryDetails?.address || '').trim(),
        phone: String(deliveryDetails?.phone || '').trim(),
        email: String(deliveryDetails?.email || '').trim(),
      };

      // Trigger Dispatch Email to Jason@cylltd.com with booker in CC
      const emailResult = await sendDispatchBookingEmail({
        bookingReference,
        quote,
        carrier,
        withInsurance: Boolean(withInsurance),
        bookerEmail: cleanBookerEmail,
        pickupDetails: sanitizedPickup,
        deliveryDetails: sanitizedDelivery,
        specialInstructions: typeof specialInstructions === 'string' ? specialInstructions.trim().slice(0, 500) : undefined,
      });

      res.json({
        success: true,
        bookingReference,
        quoteToken: token,
        carrierName: carrier.carrierName,
        serviceClass: carrier.serviceClass,
        selectedPrice: withInsurance ? carrier.finalRateWithInsurance : carrier.finalRate,
        withInsurance: Boolean(withInsurance),
        pickupDate: quote.payload.pickupDate || new Date().toISOString().split('T')[0],
        origin: quote.payload.pickupLocation,
        destination: quote.payload.deliveryLocation,
        emailDispatched: emailResult.success,
        emailNotice: emailResult.success
          ? `Dispatch notification emailed to Jason@cylltd.com with ${cleanBookerEmail} in CC.`
          : `Booking recorded. Dispatch notification pending delivery.`,
        message: 'Shipment booking confirmed. Carrier dispatch notification scheduled.',
      });
    } catch (err: any) {
      console.error('[Jason LTL Booking Error]:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal booking dispatch error.' });
    }
  });

  // -------------------------------------------------------------
  // 3. Vite Middleware / Static Serving
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // -------------------------------------------------------------
  // 4. Safe Error Handler (Must be registered last)
  // -------------------------------------------------------------
  app.use(safeErrorHandler);

  // -------------------------------------------------------------
  // 5. Start HTTP Listener
  // -------------------------------------------------------------
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jason LTL] Server running on http://0.0.0.0:${PORT}`);

    // Automatically sign in to direct carrier network session
    if (CONFIG.PASS) {
      console.log('[Jason LTL] Initiating automatic connection to direct carrier network...');
      gltService.login().then((res) => {
        if (res.success) {
          console.log(`[Jason LTL] Carrier network session active: ${res.message}`);
        } else {
          console.warn(`[Jason LTL] Carrier network session notice: ${res.message}`);
        }
      }).catch((err) => {
        console.warn(`[Jason LTL] Carrier network connection attempt error: ${err.message}`);
      });
    } else {
      console.log('[Jason LTL] Ready. Note: Set PASS in environment settings to connect live session.');
    }
  });

  // Ensure HTTP connection stays alive during long-polling rating requests (up to 120s+)
  server.setTimeout(180000);
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 130000;
}

startServer().catch((err) => {
  console.error('[Jason LTL] Fatal server initialization error:', err);
  process.exit(1);
});
