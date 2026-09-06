/**
 * Jason LTL Carrier Card Parser
 * Strictly parses and formats LIVE GLT API carrier objects.
 * Applies mandatory server-side rate markups before transmission to client.
 */

import { CarrierQuote } from '../src/types.js';
import { applyRateMarkup } from './markup.js';

export interface LiveCarrierApiItem {
  carrier?: string;
  quoteNumber?: string;
  quoteContractId?: string;
  price: number;
  transitTime?: number | string;
  serviceClass?: string;
  newLiability?: number;
  usedLiability?: number;
  pickupPerformance?: number;
  deliveryPerformance?: number;
  expiration?: string;
  logo?: string;
  thresholds?: string;
  accesorials?: any[];
  scac?: string;
  isSmartwayCertified?: boolean;
  _id?: string;
  isBookPickup?: boolean;
  isBookInsurance?: boolean;
}

export function parseTransitDays(transitTimeText: string): number {
  if (!transitTimeText) return 2;
  const match = transitTimeText.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (transitTimeText.toLowerCase().includes('same day')) return 1;
  if (transitTimeText.toLowerCase().includes('next day')) return 1;
  return 2;
}

/**
 * Maps raw live GLT carrier API data into client-facing marked-up CarrierQuote.
 * Strictly applies the tiered markup rules before transmission.
 */
export function formatLiveCarrierQuote(
  raw: LiveCarrierApiItem,
  index: number,
  quoteToken: string
): CarrierQuote {
  const seedKey = `${quoteToken}-${index}-${raw.carrier || 'carrier'}`;
  const basePrice = Number(raw.price) || 0;
  const finalRate = applyRateMarkup(basePrice, seedKey);
  const finalRateWithInsurance = applyRateMarkup(basePrice + 35, `${seedKey}-ins`);
  const insuranceCost = Math.round((finalRateWithInsurance - finalRate) * 100) / 100;

  const rawDays = typeof raw.transitTime === 'number' ? raw.transitTime : parseTransitDays(String(raw.transitTime || '2'));
  const transitDays = Math.max(1, Math.min(14, rawDays));

  const deliveryDate = new Date(Date.now() + transitDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const carrierName = raw.carrier || raw.quoteNumber || 'Freight Carrier';
  const words = carrierName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  const carrierCode = words.length > 1
    ? (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase()
    : carrierName.substring(0, 4).toUpperCase();

  const liability = raw.newLiability
    ? `$${raw.newLiability} new / $${raw.usedLiability || 0} used`
    : '$100 new / $10 used';

  let expDate = '7 Days';
  if (raw.expiration) {
    try {
      expDate = new Date(raw.expiration).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      expDate = '7 Days';
    }
  }

  return {
    id: `carrier-${index + 1}`,
    carrierId: `JLT-${raw.scac || carrierCode}-${index + 1}`,
    carrierName,
    carrierLogo: raw.logo || '',
    carrierCode: raw.scac || carrierCode,
    serviceClass: raw.serviceClass || 'Standard Rate',
    transitDays,
    estDeliveryDate: deliveryDate,
    liability,
    pickupPerformance: typeof raw.pickupPerformance === 'number' ? Math.round(raw.pickupPerformance * 10) / 10 : 96,
    deliveryPerformance: typeof raw.deliveryPerformance === 'number' ? Math.round(raw.deliveryPerformance * 10) / 10 : 92,
    quoteExpirationDate: expDate,
    notes: raw.thresholds || (raw.isSmartwayCertified ? 'SmartWay Certified Carrier' : 'Direct LTL line-haul transit'),
    finalRate,
    finalRateWithInsurance,
    insuranceCost: Math.max(insuranceCost, 25.0),
    currency: 'USD',
  };
}
