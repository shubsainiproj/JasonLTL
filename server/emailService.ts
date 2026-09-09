import nodemailer, { Transporter } from 'nodemailer';
import { CONFIG } from './config.js';
import { CarrierQuote, QuoteResult, BookingLocationDetails } from '../src/types.js';

interface DispatchEmailParams {
  bookingReference: string;
  quote: QuoteResult;
  carrier: CarrierQuote;
  withInsurance: boolean;
  bookerEmail: string;
  pickupDetails: BookingLocationDetails;
  deliveryDetails: BookingLocationDetails;
  specialInstructions?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: CONFIG.SMTP_HOST,
      port: CONFIG.SMTP_PORT,
      secure: CONFIG.SMTP_SECURE, // true for 465, false for 587
      auth: {
        user: CONFIG.SMTP_USER,
        pass: CONFIG.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed or proxy TLS errors
      },
    });
  }
  return transporter;
}

export async function sendDispatchBookingEmail(params: DispatchEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    bookingReference,
    quote,
    carrier,
    withInsurance,
    bookerEmail,
    pickupDetails,
    deliveryDetails,
    specialInstructions,
  } = params;

  const finalRate = withInsurance ? carrier.finalRateWithInsurance : carrier.finalRate;
  const payload = quote.payload;

  const subject = `[SHIPMENT DISPATCH CONFIRMED] ${bookingReference} | ${carrier.carrierName} - ${payload.pickupZip} to ${payload.deliveryZip} | ${quote.quoteToken}`;

  const accessorialsList = payload.accessorials && payload.accessorials.length > 0
    ? payload.accessorials.join(', ')
    : 'None requested (Standard dock-to-dock)';

  const lineItemsHtml = payload.lineItems.map((item, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
      <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">#${idx + 1}</td>
      <td style="padding: 10px 12px; color: #334155;">${escapeHtml(item.commodity || 'General Freight')}</td>
      <td style="padding: 10px 12px; color: #334155;">${item.units} ${escapeHtml(item.type || 'Pallets')}</td>
      <td style="padding: 10px 12px; color: #334155;">${item.weight} ${item.weightUnit || 'lbs'}</td>
      <td style="padding: 10px 12px; color: #334155;">${item.length}" x ${item.width}" x ${item.height}"</td>
      <td style="padding: 10px 12px; font-weight: 600; color: #0284c7;">Class ${item.nmfcClass || '70'}</td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Shipment Booking Dispatch</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="680" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #090d16 0%, #172033 100%); padding: 28px 32px; border-bottom: 3px solid #facc15;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #facc15; text-transform: uppercase; margin-bottom: 6px;">
                      JASON LTL &bull; CARRIER DISPATCH ORDER
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Shipment Booking Confirmation
                    </h1>
                  </td>
                  <td align="right">
                    <div style="background-color: rgba(250, 204, 21, 0.15); border: 1px solid #facc15; border-radius: 8px; padding: 8px 14px; display: inline-block; text-align: right;">
                      <div style="font-size: 10px; color: #cbd5e1; text-transform: uppercase; font-weight: 600;">Booking Reference</div>
                      <div style="font-size: 15px; font-weight: 800; color: #facc15; font-family: monospace;">${bookingReference}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice bar -->
          <tr>
            <td style="background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 12px 32px;">
              <p style="margin: 0; font-size: 13px; color: #065f46; font-weight: 500;">
                &#10004; Direct carrier dispatch scheduled. Jason LTL Operations has received this order and will tender paperwork with <strong>${escapeHtml(carrier.carrierName)}</strong>.
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 32px;">
              
              <!-- Booker & Carrier Highlights -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="48%" valign="top" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Booker / User Contact
                    </div>
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${escapeHtml(bookerEmail)}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Kept in CC for dispatch notifications</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
                      Quote Token: <span style="font-family: monospace; font-weight: 600; color: #d97706;">${quote.quoteToken}</span>
                    </div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" valign="top" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Selected Carrier & Tariff
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${escapeHtml(carrier.carrierName)}</div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">
                      Service Class: <strong>${escapeHtml(carrier.serviceClass)}</strong>
                    </div>
                    <div style="font-size: 15px; font-weight: 800; color: #059669; margin-top: 6px;">
                      $${finalRate.toFixed(2)} USD
                      ${withInsurance ? '<span style="font-size: 11px; font-weight: 700; color: #2563eb; background: #dbeafe; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">W/ Full Insurance</span>' : '<span style="font-size: 11px; color: #64748b; font-weight: normal;">(Standard Liability)</span>'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Origin and Delivery Locations -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <!-- Pickup Location -->
                  <td width="48%" valign="top" style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; background-color: #ffffff;">
                    <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      &#x1F4CD; Pickup / Origin Location
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.5;">
                      <tr>
                        <td width="70" style="color: #64748b; font-weight: 600; padding: 3px 0;">ZIP / City:</td>
                        <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">${escapeHtml(payload.pickupZip)} (${payload.pickupCountry || 'US'}) - ${escapeHtml(payload.pickupLocation)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Address:</td>
                        <td style="color: #0f172a; padding: 3px 0;">${escapeHtml(pickupDetails.address || 'Dock Address Provided Upon Dispatch')}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Phone:</td>
                        <td style="color: #0f172a; padding: 3px 0;">${escapeHtml(pickupDetails.phone || 'N/A')}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Email:</td>
                        <td style="color: #0f172a; padding: 3px 0;">${escapeHtml(pickupDetails.email || 'N/A')}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Date:</td>
                        <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">${payload.pickupDate || 'Earliest available business day'}</td>
                      </tr>
                    </table>
                  </td>

                  <td width="4%"></td>

                  <!-- Delivery Location -->
                  <td width="48%" valign="top" style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; background-color: #ffffff;">
                    <div style="font-size: 12px; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      &#x1F4CD; Delivery / Destination Location
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.5;">
                      <tr>
                        <td width="70" style="color: #64748b; font-weight: 600; padding: 3px 0;">ZIP / City:</td>
                        <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">${escapeHtml(payload.deliveryZip)} (${payload.deliveryCountry || 'US'}) - ${escapeHtml(payload.deliveryLocation)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Address:</td>
                        <td style="color: #0f172a; padding: 3px 0;">${escapeHtml(deliveryDetails.address || 'Receiving Dock Address Provided')}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Phone:</td>
                        <td style="color: #0f172a; padding: 3px 0;">${escapeHtml(deliveryDetails.phone || 'N/A')}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Email:</td>
                        <td style="color: #0f172a; padding: 3px 0;">${escapeHtml(deliveryDetails.email || 'N/A')}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 3px 0;">Est. Delivery:</td>
                        <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">${carrier.transitDays} Days (${carrier.estDeliveryDate})</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Freight Line Items Table -->
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                Shipment Cargo Specifications (${quote.totalUnits} Units &bull; ${quote.totalWeightLbs.toLocaleString()} lbs)
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; letter-spacing: 0.5px;">
                    <th style="padding: 10px 12px;">#</th>
                    <th style="padding: 10px 12px;">Commodity</th>
                    <th style="padding: 10px 12px;">Units</th>
                    <th style="padding: 10px 12px;">Weight</th>
                    <th style="padding: 10px 12px;">Dimensions</th>
                    <th style="padding: 10px 12px;">Class</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineItemsHtml}
                </tbody>
              </table>

              <!-- Carrier Terms, Liability, and Accessorials -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                      Carrier Liability & Equipment Accessorials:
                    </div>
                    <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                      &bull; <strong>Liability Coverage:</strong> ${escapeHtml(carrier.liability)}<br>
                      &bull; <strong>Accessorials Tendered:</strong> ${escapeHtml(accessorialsList)}<br>
                      &bull; <strong>Carrier Code / ID:</strong> ${escapeHtml(carrier.carrierCode || 'N/A')} / ${escapeHtml(carrier.carrierId)}<br>
                      ${specialInstructions ? `&bull; <strong>Special Instructions:</strong> ${escapeHtml(specialInstructions)}<br>` : ''}
                    </div>
                    ${carrier.notes ? `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; line-height: 1.5;">
                      <strong>Carrier Tariff Notes:</strong> ${escapeHtml(carrier.notes)}
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Action button & Footer note -->
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 0;">
                Jason LTL Dispatch will generate the unified Bill of Lading (BOL) and coordinate direct terminal dispatch. If any information needs updating, reply directly to this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Jason LTL &bull; Direct Carrier Dispatch Network &bull; CYL Ltd.<br>
                Dispatch: <a href="mailto:Jason@cylltd.com" style="color: #facc15; text-decoration: none;">Jason@cylltd.com</a> &bull; Operations & Logistics
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
============================================================
JASON LTL - SHIPMENT BOOKING DISPATCH CONFIRMATION
============================================================
Booking Reference: ${bookingReference}
Quote Token: ${quote.quoteToken}
Booker / User Email: ${bookerEmail}

SELECTED CARRIER:
------------------------------------------------------------
Carrier: ${carrier.carrierName} (${carrier.carrierCode || 'N/A'})
Service Class: ${carrier.serviceClass}
Final Price: $${finalRate.toFixed(2)} USD ${withInsurance ? '(WITH FULL INSURANCE)' : '(Standard Liability)'}
Estimated Transit: ${carrier.transitDays} Days (${carrier.estDeliveryDate})
Liability: ${carrier.liability}

PICKUP / ORIGIN DETAILS:
------------------------------------------------------------
ZIP / City: ${payload.pickupZip} (${payload.pickupCountry || 'US'}) - ${payload.pickupLocation}
Address: ${pickupDetails.address || 'Dock address provided upon dispatch'}
Phone: ${pickupDetails.phone || 'N/A'}
Email: ${pickupDetails.email || 'N/A'}
Scheduled Pickup Date: ${payload.pickupDate || 'Earliest available business day'}

DELIVERY / DESTINATION DETAILS:
------------------------------------------------------------
ZIP / City: ${payload.deliveryZip} (${payload.deliveryCountry || 'US'}) - ${payload.deliveryLocation}
Address: ${deliveryDetails.address || 'Receiving dock address provided'}
Phone: ${deliveryDetails.phone || 'N/A'}
Email: ${deliveryDetails.email || 'N/A'}

SHIPMENT CARGO:
------------------------------------------------------------
Total Weight: ${quote.totalWeightLbs} lbs | Total Units: ${quote.totalUnits}
Accessorials: ${accessorialsList}
${specialInstructions ? `Special Instructions: ${specialInstructions}\n` : ''}
${carrier.notes ? `Carrier Tariff Notes: ${carrier.notes}\n` : ''}
============================================================
Jason LTL Dispatch &bull; Jason@cylltd.com
  `;

  try {
    const client = getTransporter();
    const mailOptions = {
      from: `"Jason LTL Dispatch" <${CONFIG.SMTP_USER}>`,
      to: CONFIG.DISPATCH_EMAIL_TO, // Jason@cylltd.com
      cc: bookerEmail, // Booker / user email in cc
      replyTo: bookerEmail,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`[Jason LTL Dispatch] Booking email dispatched successfully! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[Jason LTL Dispatch] Failed to send booking dispatch email:', err.message || err);
    return { success: false, error: err.message || 'SMTP transmission error.' };
  }
}

function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
