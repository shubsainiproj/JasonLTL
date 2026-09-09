import { LocationSuggestion } from '../src/types.js';
import axios from 'axios';
import { CONFIG } from './config.js';

// Logistics hubs and representative US postal reference database
const US_POSTAL_HUBS: LocationSuggestion[] = [
  { zip: '90001', city: 'Los Angeles', state: 'CA', formatted: 'Los Angeles, CA 90001' },
  { zip: '90210', city: 'Beverly Hills', state: 'CA', formatted: 'Beverly Hills, CA 90210' },
  { zip: '90744', city: 'Wilmington (Port of LA)', state: 'CA', formatted: 'Wilmington, CA 90744' },
  { zip: '91761', city: 'Ontario (Inland Empire Hub)', state: 'CA', formatted: 'Ontario, CA 91761' },
  { zip: '94102', city: 'San Francisco', state: 'CA', formatted: 'San Francisco, CA 94102' },
  { zip: '94607', city: 'Oakland (Port of Oakland)', state: 'CA', formatted: 'Oakland, CA 94607' },
  { zip: '60601', city: 'Chicago', state: 'IL', formatted: 'Chicago, IL 60601' },
  { zip: '60666', city: 'Chicago O\'Hare Cargo', state: 'IL', formatted: 'Chicago, IL 60666' },
  { zip: '60455', city: 'Bridgeview', state: 'IL', formatted: 'Bridgeview, IL 60455' },
  { zip: '75201', city: 'Dallas', state: 'TX', formatted: 'Dallas, TX 75201' },
  { zip: '77001', city: 'Houston', state: 'TX', formatted: 'Houston, TX 77001' },
  { zip: '77547', city: 'Galena Park (Jacinto Port)', state: 'TX', formatted: 'Galena Park, TX 77547' },
  { zip: '78201', city: 'San Antonio', state: 'TX', formatted: 'San Antonio, TX 78201' },
  { zip: '79901', city: 'El Paso', state: 'TX', formatted: 'El Paso, TX 79901' },
  { zip: '30301', city: 'Atlanta', state: 'GA', formatted: 'Atlanta, GA 30301' },
  { zip: '31401', city: 'Savannah (Port of Savannah)', state: 'GA', formatted: 'Savannah, GA 31401' },
  { zip: '33101', city: 'Miami', state: 'FL', formatted: 'Miami, FL 33101' },
  { zip: '33601', city: 'Tampa', state: 'FL', formatted: 'Tampa, FL 33601' },
  { zip: '32201', city: 'Jacksonville', state: 'FL', formatted: 'Jacksonville, FL 32201' },
  { zip: '10001', city: 'New York', state: 'NY', formatted: 'New York, NY 10001' },
  { zip: '07101', city: 'Newark (Port Newark)', state: 'NJ', formatted: 'Newark, NJ 07101' },
  { zip: '19101', city: 'Philadelphia', state: 'PA', formatted: 'Philadelphia, PA 19101' },
  { zip: '17055', city: 'Mechanicsburg (Freight Hub)', state: 'PA', formatted: 'Mechanicsburg, PA 17055' },
  { zip: '02101', city: 'Boston', state: 'MA', formatted: 'Boston, MA 02101' },
  { zip: '48201', city: 'Detroit', state: 'MI', formatted: 'Detroit, MI 48201' },
  { zip: '43201', city: 'Columbus', state: 'OH', formatted: 'Columbus, OH 43201' },
  { zip: '45201', city: 'Cincinnati', state: 'OH', formatted: 'Cincinnati, OH 45201' },
  { zip: '46201', city: 'Indianapolis', state: 'IN', formatted: 'Indianapolis, IN 46201' },
  { zip: '40201', city: 'Louisville (UPS Worldport)', state: 'KY', formatted: 'Louisville, KY 40201' },
  { zip: '38101', city: 'Memphis (FedEx SuperHub)', state: 'TN', formatted: 'Memphis, TN 38101' },
  { zip: '37201', city: 'Nashville', state: 'TN', formatted: 'Nashville, TN 37201' },
  { zip: '28201', city: 'Charlotte', state: 'NC', formatted: 'Charlotte, NC 28201' },
  { zip: '27601', city: 'Raleigh', state: 'NC', formatted: 'Raleigh, NC 27601' },
  { zip: '80201', city: 'Denver', state: 'CO', formatted: 'Denver, CO 80201' },
  { zip: '85001', city: 'Phoenix', state: 'AZ', formatted: 'Phoenix, AZ 85001' },
  { zip: '89101', city: 'Las Vegas', state: 'NV', formatted: 'Las Vegas, NV 89101' },
  { zip: '84101', city: 'Salt Lake City', state: 'UT', formatted: 'Salt Lake City, UT 84101' },
  { zip: '98101', city: 'Seattle', state: 'WA', formatted: 'Seattle, WA 98101' },
  { zip: '97201', city: 'Portland', state: 'OR', formatted: 'Portland, OR 97201' },
  { zip: '64101', city: 'Kansas City', state: 'MO', formatted: 'Kansas City, MO 64101' },
  { zip: '63101', city: 'St. Louis', state: 'MO', formatted: 'St. Louis, MO 63101' },
  { zip: '55401', city: 'Minneapolis', state: 'MN', formatted: 'Minneapolis, MN 55401' },
  { zip: '53201', city: 'Milwaukee', state: 'WI', formatted: 'Milwaukee, WI 53201' },
  { zip: '70112', city: 'New Orleans', state: 'LA', formatted: 'New Orleans, LA 70112' },
  { zip: '21201', city: 'Baltimore (Port of Baltimore)', state: 'MD', formatted: 'Baltimore, MD 21201' },
  { zip: '23501', city: 'Norfolk (Port of Virginia)', state: 'VA', formatted: 'Norfolk, VA 23501' },
  { zip: '29401', city: 'Charleston (Port of Charleston)', state: 'SC', formatted: 'Charleston, SC 29401' },
  { zip: '93701', city: 'Fresno', state: 'CA', formatted: 'Fresno, CA 93701' },
  { zip: '92101', city: 'San Diego', state: 'CA', formatted: 'San Diego, CA 92101' },
];

// Canadian postal reference hubs
const CA_POSTAL_HUBS: LocationSuggestion[] = [
  { zip: 'M5H 2N2', city: 'Toronto', state: 'ON', formatted: 'Toronto, ON M5H 2N2' },
  { zip: 'H3B 1A7', city: 'Montreal', state: 'QC', formatted: 'Montreal, QC H3B 1A7' },
  { zip: 'V6B 1A1', city: 'Vancouver', state: 'BC', formatted: 'Vancouver, BC V6B 1A1' },
  { zip: 'T2P 1J9', city: 'Calgary', state: 'AB', formatted: 'Calgary, AB T2P 1J9' },
  { zip: 'T5J 0K1', city: 'Edmonton', state: 'AB', formatted: 'Edmonton, AB T5J 0K1' },
  { zip: 'K1P 1J1', city: 'Ottawa', state: 'ON', formatted: 'Ottawa, ON K1P 1J1' },
  { zip: 'R3C 0V8', city: 'Winnipeg', state: 'MB', formatted: 'Winnipeg, MB R3C 0V8' },
  { zip: 'L4W 1S9', city: 'Mississauga', state: 'ON', formatted: 'Mississauga, ON L4W 1S9' },
  { zip: 'B3J 1S9', city: 'Halifax', state: 'NS', formatted: 'Halifax, NS B3J 1S9' },
  { zip: 'T8N 1E8', city: 'St. Albert', state: 'AB', formatted: 'St. Albert, AB T8N 1E8' },
];

export async function searchLocations(query: string, token?: string, countryCode: string = 'US'): Promise<LocationSuggestion[]> {
  const isCanada = countryCode?.toUpperCase() === 'CA';
  const defaultHubs = isCanada ? CA_POSTAL_HUBS : US_POSTAL_HUBS;

  // Sanitize query to prevent parameter injection or excessive length
  const clean = String(query || '')
    .replace(/[^\w\s,-]/gi, '')
    .trim()
    .slice(0, 50);

  if (!clean || clean.length < 2) {
    return defaultHubs.slice(0, 8);
  }

  const apiCountry = isCanada ? 'CA' : 'US';

  // If token is provided, query carrier live /api/locations endpoint
  if (token) {
    try {
      const isZip = isCanada ? /^[A-Za-z]\d[A-Za-z]/i.test(clean) : /^\d+$/.test(clean);
      const url = isZip
        ? `${CONFIG.GLT_API_URL}/api/locations?zip_code=${encodeURIComponent(clean)}&country_code=${apiCountry}`
        : `${CONFIG.GLT_API_URL}/api/locations?city=${encodeURIComponent(clean)}&country_code=${apiCountry}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 4500,
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        const unique = new Map<string, LocationSuggestion>();
        for (const item of res.data) {
          const zip = item.zip_code || '';
          const city = item.city || '';
          const state = item.state_code || '';
          const key = `${city}-${state}-${zip}`;
          if (!unique.has(key) && zip) {
            unique.set(key, {
              zip,
              city,
              state,
              formatted: `${city}, ${state} ${zip}`,
            });
          }
          if (unique.size >= 10) break;
        }
        if (unique.size > 0) {
          return Array.from(unique.values());
        }
      }
    } catch {
      // Continue to fallback hubs
    }
  }

  const lower = clean.toLowerCase();
  const matches = defaultHubs.filter(
    (loc) =>
      loc.zip.toLowerCase().startsWith(lower) ||
      loc.city.toLowerCase().includes(lower) ||
      loc.state.toLowerCase() === lower ||
      loc.formatted.toLowerCase().includes(lower)
  );

  // If query looks like a postal code not in our main list, generate entry
  if (!isCanada && /^\d{5}$/.test(clean) && !matches.some((m) => m.zip === clean)) {
    return [
      {
        zip: clean,
        city: 'US Postal Terminal',
        state: 'US',
        formatted: `${clean} (US Postal Terminal)`,
      },
      ...matches.slice(0, 7),
    ];
  } else if (isCanada && /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i.test(clean) && !matches.some((m) => m.zip.toLowerCase() === clean.toLowerCase())) {
    return [
      {
        zip: clean.toUpperCase(),
        city: 'Canadian Freight Terminal',
        state: 'CA',
        formatted: `${clean.toUpperCase()} (Canadian Freight Terminal)`,
      },
      ...matches.slice(0, 7),
    ];
  }

  return matches.slice(0, 10);
}
