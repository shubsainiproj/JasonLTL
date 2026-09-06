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

async function startServer() {
  const app = express();
  const PORT = CONFIG.PORT;

  app.use(express.json());

  // -------------------------------------------------------------
  // API Endpoints
  // -------------------------------------------------------------

  // Health check & System / GLT status
  app.get('/api/status', (req, res) => {
    try {
      const status = gltService.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Manual or initial re-authentication trigger (supports both /api/auth/login and /api/login)
  const handleLogin = async (req: express.Request, res: express.Response) => {
    try {
      const result = await gltService.login();
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  app.post('/api/auth/login', handleLogin);
  app.post('/api/login', handleLogin);
  app.get('/api/auth/login', handleLogin);
  app.get('/api/login', handleLogin);

  // Authenticated Carrier Loads history route (verifies active account loads)
  app.get('/api/loads', async (req, res) => {
    try {
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
        account: session.accountName || 'Jason Harris',
        loads: loadsRes.data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.response?.data || err.message });
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

  // Location autocomplete (zip / city / hub lookup)
  app.get('/api/locations/autocomplete', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      const session = gltService.getSessionData();
      const results = await searchLocations(query, session?.authToken);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Submit Freight Quote Request
  app.post('/api/quote', async (req, res) => {
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

  // Retrieve Quote by Token (for token-based carrier selection page)
  app.get('/api/quote/:token', (req, res) => {
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

  // Book shipment with carrier
  app.post('/api/quote/:token/book', (req, res) => {
    const { token } = req.params;
    const { carrierId, withInsurance } = req.body;

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
      message: 'Shipment booking confirmed. Carrier dispatch notification scheduled.',
    });
  });

  // -------------------------------------------------------------
  // Vite Middleware / Static Serving
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
  // Start HTTP Listener
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

  // Ensure HTTP connection stays alive during long-polling rating requests (up to 60s)
  server.setTimeout(120000);
  server.keepAliveTimeout = 75000;
  server.headersTimeout = 80000;
}

startServer().catch((err) => {
  console.error('[Jason LTL] Fatal server initialization error:', err);
  process.exit(1);
});
