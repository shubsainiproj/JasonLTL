import axios from 'axios';
import fs from 'fs';
import { CarrierQuote, LineItem, QuoteRequestPayload, QuoteResult, SystemStatus } from '../src/types.js';
import { CONFIG, getMaskedEmail, isCredentialsConfigured } from './config.js';
import { generateToken, saveQuote } from './quoteStore.js';
import { formatLiveCarrierQuote, LiveCarrierApiItem } from './carrierParser.js';

interface StoredSession {
  cookies: any[];
  userEmail: string;
  lastLoginTime: string;
  currentUrl?: string;
  authToken?: string;
  refreshToken?: string;
  accountName?: string;
  authMethod?: string;
}

export class GLTService {
  private isLoggingIn: boolean = false;
  private activeLoginPromise: Promise<{ success: boolean; message: string; data?: any }> | null = null;
  private sessionData: StoredSession | null = null;
  private lastStatusMessage: string = 'Initialized. Ready to authenticate.';

  constructor() {
    this.loadSession();
    // Auto-authenticate on startup if credentials configured and no active session
    if (isCredentialsConfigured() && (!this.sessionData || !this.sessionData.authToken)) {
      this.login().catch((err) => {
        console.warn('Startup login attempt notice:', err.message);
      });
    }
  }

  private loadSession(): void {
    try {
      if (fs.existsSync(CONFIG.SESSION_FILE)) {
        const raw = fs.readFileSync(CONFIG.SESSION_FILE, 'utf-8');
        this.sessionData = JSON.parse(raw);
      }
    } catch {
      this.sessionData = null;
    }
  }

  private saveSession(session: StoredSession): void {
    this.sessionData = session;
    try {
      fs.writeFileSync(CONFIG.SESSION_FILE, JSON.stringify(session, null, 2), 'utf-8');
    } catch {
      // ignore write error
    }
  }

  public getStatus(): SystemStatus {
    const credsReady = isCredentialsConfigured();
    const hasSession = Boolean(this.sessionData && this.sessionData.authToken);

    return {
      service: 'Jason LTL Direct Carrier Network',
      portalUrl: 'https://jasonltl.com',
      credentialsConfigured: credsReady,
      emailMasked: getMaskedEmail(),
      sessionActive: hasSession,
      lastLoginTime: this.sessionData?.lastLoginTime,
      environment: CONFIG.NODE_ENV,
      platform: 'Jason LTL Cloud Engine',
      message: this.lastStatusMessage?.replace(/GLT/gi, 'Jason LTL')?.replace(/goglt\.com/gi, 'jasonltl.com') || 'Connected',
      accountName: this.sessionData?.accountName || (hasSession ? 'Jason CYL Ltd' : undefined),
      authMethod: this.sessionData?.authMethod || (hasSession ? 'Direct Carrier API' : undefined),
    };
  }

  public getSessionData(): StoredSession | null {
    return this.sessionData;
  }

  /**
   * High-speed, direct OAuth2 authentication to https://api-portal.goglt.com/api/auth/access-token
   * Provides genuine, real-time access token for GLT Live Rating Engine.
   */
  public async login(): Promise<{ success: boolean; message: string; data?: any }> {
    if (this.activeLoginPromise) {
      return this.activeLoginPromise;
    }
    this.activeLoginPromise = this.performLogin();
    try {
      return await this.activeLoginPromise;
    } finally {
      this.activeLoginPromise = null;
    }
  }

  private async performLogin(): Promise<{ success: boolean; message: string; data?: any }> {
    if (!isCredentialsConfigured()) {
      const msg = 'Missing PASS environment variable. Add PASS=<password> in your .env or Render dashboard.';
      this.lastStatusMessage = msg;
      return { success: false, message: msg };
    }

    this.isLoggingIn = true;
    this.lastStatusMessage = `Connecting to direct carrier network as ${CONFIG.EMAIL}...`;

    try {
      const formData = new URLSearchParams();
      formData.append('username', CONFIG.EMAIL);
      formData.append('password', CONFIG.PASS);

      const tokenRes = await axios.post(`${CONFIG.GLT_API_URL}/api/auth/access-token`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Origin: CONFIG.GLT_PORTAL_URL,
          Referer: CONFIG.GLT_LOGIN_URL,
        },
        timeout: 12000,
      });

      if (!tokenRes.data || !tokenRes.data.access_token) {
        throw new Error('Carrier authentication did not return a valid session token.');
      }

      const accessToken: string = tokenRes.data.access_token;
      const refreshToken: string = tokenRes.data.refresh_token || '';
      let accountName = 'Jason CYL Ltd';

      // Confirm user profile identity
      try {
        const userRes = await axios.get(`${CONFIG.GLT_API_URL}/api/users/me/complete`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 8000,
        });
        if (userRes.data?.first_name || userRes.data?.username) {
          const fullName = `${userRes.data.first_name || ''} ${userRes.data.lastname || ''}`.trim();
          accountName = fullName || userRes.data.username || accountName;
        }
      } catch {
        // non-fatal user detail lookup
      }

      this.saveSession({
        cookies: [],
        userEmail: CONFIG.EMAIL,
        lastLoginTime: new Date().toISOString(),
        currentUrl: CONFIG.GLT_QUOTE_URL,
        authToken: accessToken,
        refreshToken,
        accountName,
        authMethod: 'Direct Carrier API',
      });

      this.lastStatusMessage = `Authenticated successfully for ${accountName} (${CONFIG.EMAIL}). Direct carrier network active.`;
      return {
        success: true,
        message: this.lastStatusMessage,
        data: {
          accountName,
          email: CONFIG.EMAIL,
          authMethod: 'Direct Carrier API',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message;
      this.lastStatusMessage = `Carrier network connection error: ${errMsg}`;
      return {
        success: false,
        message: `Carrier network connection error: ${errMsg}. Please check credentials.`,
      };
    } finally {
      this.isLoggingIn = false;
    }
  }

  /**
   * Ensures a valid bearer token is available, re-authenticating if needed.
   */
  public async getValidToken(): Promise<string> {
    if (!this.sessionData?.authToken) {
      const loginRes = await this.login();
      if (!loginRes.success || !this.sessionData?.authToken) {
        throw new Error(`Unable to connect to carrier network: ${loginRes.message}`);
      }
    }
    return this.sessionData.authToken;
  }

  /**
   * Submit live quote request to GLT Rating Engine:
   * 1. Creates Load via POST /api/loads/v2
   * 2. Triggers rating via POST /api/loads/{id}/quote
   * 3. Polls GET /api/loads/{id}/carriers until live carriers respond
   * 4. Applies mandatory server-side markup before transmitting to customer
   * STRICTLY NO DUMMY OR MOCK DATA.
   */
  public async submitQuote(payload: QuoteRequestPayload): Promise<{
    success: boolean;
    data?: QuoteResult;
    error?: string;
  }> {
    // 1. Validate payload
    if (!payload.pickupZip || !payload.deliveryZip) {
      return { success: false, error: 'Pickup Zip Code and Delivery Zip Code are required.' };
    }

    if (!payload.lineItems || payload.lineItems.length === 0) {
      return { success: false, error: 'Please provide at least one cargo line item.' };
    }

    for (let i = 0; i < payload.lineItems.length; i++) {
      const item = payload.lineItems[i];
      if (!item.units || item.units <= 0) {
        return { success: false, error: `Line item #${i + 1}: Units must be at least 1.` };
      }
      if (!item.weight || item.weight <= 0) {
        return { success: false, error: `Line item #${i + 1}: Weight must be greater than 0.` };
      }
      if (!item.commodity || item.commodity.trim().length === 0) {
        return { success: false, error: `Line item #${i + 1}: Commodity description is required.` };
      }
      if (!item.nmfcClass) {
        return { success: false, error: `Line item #${i + 1}: NMFC Class is required.` };
      }
    }

    const totalWeightLbs = payload.lineItems.reduce((acc, item) => {
      const w = item.weightUnit === 'kg' ? item.weight * 2.20462 : item.weight;
      return acc + w * (item.units || 1);
    }, 0);

    const totalUnits = payload.lineItems.reduce((acc, item) => acc + (item.units || 1), 0);

    let token: string;
    try {
      token = await this.getValidToken();
    } catch (err: any) {
      return { success: false, error: err.message };
    }

    const quoteToken = generateToken();

    // Check if any hazmat accessorial is requested
    const isHazmat = (payload.accessorials || []).some(
      (acc: string) => acc === '29' || acc === '103' || acc === '28' || acc === '34' || acc === '125' || /hazmat/i.test(acc)
    );

    // 2. Prepare GLT API Load creation payload
    const gltLineItems = payload.lineItems.map((item: LineItem, idx: number) => {
      const weightLbs = item.weightUnit === 'kg' ? Math.round(item.weight * 2.20462) : item.weight;
      const lengthIn = item.dimUnit === 'cm' ? Math.round(item.length / 2.54) : (item.length || 48);
      const widthIn = item.dimUnit === 'cm' ? Math.round(item.width / 2.54) : (item.width || 40);
      const heightIn = item.dimUnit === 'cm' ? Math.round(item.height / 2.54) : (item.height || 48);

      return {
        name: item.commodity.trim() || `Line ${idx + 1}`,
        description: item.commodity.trim() || 'General Freight',
        handling_unit_count: item.units || 1,
        handling_units: item.type || 'Pallets',
        height: heightIn,
        length: lengthIn,
        width: widthIn,
        linear_feet: Math.round(((lengthIn * (item.units || 1)) / 12) * 10) / 10,
        nmfc_class: String(item.nmfcClass || '70'),
        weight_units: 'lbs',
        weight: weightLbs,
        dimension_units: 'in',
        pickup_stop: 'stop-pickup',
        delivery_stop: 'stop-delivery',
        hazardous_materials: isHazmat,
        packaging_unit_count: item.units || 1,
        packaging_units: item.type || 'Pallets',
      };
    });

    const gltStops = [
      {
        name: 'Pickup',
        related_name: 'stop-pickup',
        is_pickup: true,
        is_dropoff: false,
        number: 1,
        zip_code: payload.pickupZip.trim(),
        city: payload.pickupCity?.trim() || undefined,
        state_code: payload.pickupState?.trim() || undefined,
        country_code: payload.pickupCountry || 'US',
      },
      {
        name: 'Delivery',
        related_name: 'stop-delivery',
        is_pickup: false,
        is_dropoff: true,
        number: 2,
        zip_code: payload.deliveryZip.trim(),
        city: payload.deliveryCity?.trim() || undefined,
        state_code: payload.deliveryState?.trim() || undefined,
        country_code: payload.deliveryCountry || 'US',
      },
    ];

    const loadPayload = {
      load: {
        mode_id: 'a0k1I0000005NnyQAE', // LTL mode
        customer_id: '001Rc00000iaenCIAQ', // Direct carrier account ID
        total_weight: Math.round(totalWeightLbs),
        cargo_value_for_insurance: payload.cargoValue || null,
        origin_portal_quote: true,
        origin_portal_quote_email: CONFIG.EMAIL,
      },
      stops: gltStops,
      line_items: gltLineItems,
      accessorials: [],
    };

    let loadId: string | null = null;

    try {
      // 3. Create Load on GLT Portal
      let loadRes;
      try {
        loadRes = await axios.post(`${CONFIG.GLT_API_URL}/api/loads/v2`, loadPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        });
      } catch (postErr: any) {
        // If 401 Unauthorized, refresh token once and retry
        if (postErr.response?.status === 401) {
          console.log('[Jason LTL] Token expired, refreshing session...');
          await this.login();
          token = await this.getValidToken();
          loadRes = await axios.post(`${CONFIG.GLT_API_URL}/api/loads/v2`, loadPayload, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          });
        } else {
          throw postErr;
        }
      }

      loadId = loadRes.data?.id;
      if (!loadId) {
        throw new Error('Load creation did not return a valid dispatch ID.');
      }

      console.log(`[Jason LTL] Load successfully created: ${loadId}`);

      // 4. Attach any selected accessorials via dedicated endpoint
      if (payload.accessorials && payload.accessorials.length > 0) {
        const ACCESSORIAL_NAMES: Record<string, string> = {
          '4': 'CFS Pick Up',
          '19': 'Liftgate Pick Up',
          '21': 'Residential Pick Up',
          '3': 'CFS Delivery',
          '18': 'Liftgate Delivery',
          '20': 'Residential Delivery',
          '29': 'Hazmat',
          '15': 'Non Stackable',
          '41': 'Stackable',
          '40': 'Air Ride truck',
          '16': 'Bonded',
          '39': 'Bonded + Form 7512',
          '100': 'Double Blind',
          '80': 'Envelope(s)',
          '14': 'Guaranteed transit time',
          '11': 'Guns handling license',
          '103': 'Hazmat 2.3',
          '28': 'Hazmat Explosives 1.4',
          '34': 'Hazmat Toxic or Poison 6.1',
          '63': 'Household Goods',
          '43': 'Liquids',
          '33': 'Over Dimension (length)',
          '85': 'Protect from Freeze',
          '35': 'Single Shipment',
          '36': 'Sort and Segregate',
          '101': 'Temperature Control',
          '42': 'Trade Show',
          '47': 'Airport Pickup',
          '17': 'Construction Site Pick Up',
          '1': 'Inside Pick Up',
          '58': 'Military Base Pick Up',
          '46': 'Airport Delivery',
          '7': 'Construction Site Delivery',
          '2': 'Inside Delivery',
          '57': 'Military Base Delivery',
        };

        for (const rawAcc of payload.accessorials) {
          const accStr = String(rawAcc).trim();
          const accIdNum = parseInt(accStr, 10);
          const name = ACCESSORIAL_NAMES[accStr] || accStr;
          if (!isNaN(accIdNum)) {
            try {
              await axios.post(
                `${CONFIG.GLT_API_URL}/api/loads/${loadId}/accessorials`,
                {
                  id_load: loadId,
                  accessorial_id: accIdNum,
                  name,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                  timeout: 5000,
                }
              );
            } catch (accErr: any) {
              console.warn(
                `[Jason LTL] Accessorial ${accStr} (${name}) attach notice:`,
                accErr.response?.data || accErr.message
              );
            }
          }
        }
      }

      // 5. Trigger Live Quote calculation
      await axios.post(`${CONFIG.GLT_API_URL}/api/loads/${loadId}/quote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      console.log(`[Jason LTL] Quote requested for Load ${loadId}. Polling carrier rating engine...`);

      // 5. Poll for live carrier quotes accurately for up to 60 seconds
      let liveCarriers: LiveCarrierApiItem[] = [];
      const startTime = Date.now();
      const maxWaitMs = 60000; // 60s maximum polling ceiling as requested
      const pollIntervalMs = 1500; // Poll every 1.5s
      let lastCarrierCount = 0;
      let stableCountIterations = 0;

      while (Date.now() - startTime < maxWaitMs) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

        const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

        try {
          const carrierRes = await axios.get(`${CONFIG.GLT_API_URL}/api/loads/${loadId}/carriers`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000,
          });

          const carriersList: LiveCarrierApiItem[] = carrierRes.data?.carriers || [];
          const validCarriers = carriersList.filter(
            (c) => typeof c.price === 'number' && c.price > 0
          );
          const currentCount = validCarriers.length;

          console.log(
            `[Jason LTL] Polling carrier rating engine [${elapsedSeconds}s / 60s]: ${currentCount} live carriers available`
          );

          if (currentCount > 0) {
            liveCarriers = validCarriers;

            if (currentCount === lastCarrierCount) {
              stableCountIterations++;
            } else {
              stableCountIterations = 0;
              lastCarrierCount = currentCount;
            }

            // High-confidence completion triggers:
            // 1. Full carrier matrix (> 25 carriers) and count is stable for at least 1-2 checks
            if (currentCount >= 25 && stableCountIterations >= 1) {
              console.log(
                `[Jason LTL] Full carrier rate matrix ready (${currentCount} carriers) after ${elapsedSeconds}s. Proceeding.`
              );
              break;
            }

            // 2. Stable carrier pool (> 10 carriers) stable for 3 consecutive polls (4.5s)
            if (currentCount >= 10 && stableCountIterations >= 3) {
              console.log(
                `[Jason LTL] Carrier pool stabilized with ${currentCount} carriers after ${elapsedSeconds}s. Proceeding.`
              );
              break;
            }

            // 3. Smaller carrier count (> 0 carriers) stable for 4 consecutive polls (6s) or after 35s
            if (stableCountIterations >= 4 || elapsedSeconds >= 35) {
              console.log(
                `[Jason LTL] Rate capture complete with ${currentCount} carriers after ${elapsedSeconds}s. Proceeding.`
              );
              break;
            }
          }
        } catch (pollErr: any) {
          if (pollErr.response?.status === 401) {
            console.log('[Jason LTL] Token expired during rating poll, refreshing...');
            try {
              await this.login();
              token = await this.getValidToken();
            } catch (authErr: any) {
              console.warn('[Jason LTL] Token refresh attempt failed:', authErr.message);
            }
          } else {
            console.warn(
              `[Jason LTL] Polling step check at ${elapsedSeconds}s notice:`,
              pollErr.response?.status || pollErr.message
            );
          }
        }
      }

      // If loop ended and we still don't have carriers, perform one final retry check
      if (liveCarriers.length === 0) {
        console.log('[Jason LTL] Performing final rate verification check...');
        try {
          const finalCheck = await axios.get(`${CONFIG.GLT_API_URL}/api/loads/${loadId}/carriers`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 9000,
          });
          const carriersList: LiveCarrierApiItem[] = finalCheck.data?.carriers || [];
          liveCarriers = carriersList.filter(
            (c) => typeof c.price === 'number' && c.price > 0
          );
        } catch (finalErr: any) {
          console.warn('[Jason LTL] Final carrier check error:', finalErr.message);
        }
      }

      if (liveCarriers.length === 0) {
        return {
          success: false,
          error: `Live rating engine returned 0 carrier quotes within 60 seconds for route ${payload.pickupZip} to ${payload.deliveryZip}. Please check the zip codes, handling units, or weight.`,
        };
      }

      // 6. Map each real live carrier with mandatory server-side markup
      const markedUpCarriers: CarrierQuote[] = liveCarriers
        .filter((c) => typeof c.price === 'number' && c.price > 0)
        .map((c, idx) => formatLiveCarrierQuote(c, idx, quoteToken))
        .sort((a, b) => a.finalRate - b.finalRate); // Sort by lowest marked-up price first

      if (markedUpCarriers.length === 0) {
        return {
          success: false,
          error: `Live carrier rates could not be verified for route ${payload.pickupZip} to ${payload.deliveryZip}. (0 valid prices returned).`,
        };
      }

      console.log(`[Jason LTL] Successfully retrieved ${markedUpCarriers.length} LIVE carrier rates!`);

      const result: QuoteResult = {
        quoteToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        payload,
        totalWeightLbs: Math.round(totalWeightLbs),
        totalUnits,
        carriers: markedUpCarriers,
        status: 'active',
      };

      saveQuote(result);
      return { success: true, data: result };
    } catch (err: any) {
      console.error('[Jason LTL] Quote submission failed:', err.response?.data || err.message);
      const detail = err.response?.data?.detail;
      const rawError = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ')
        : err.message || 'Failed to retrieve live quotes from carrier network.';

      const sanitizedMsg = rawError.replace(/GLT/gi, 'Carrier Network').replace(/goglt\.com/gi, 'jasonltl.com');

      return {
        success: false,
        error: `Carrier Rating Engine: ${sanitizedMsg}`,
      };
    }
  }
}

export const gltService = new GLTService();
