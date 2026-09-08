export interface LineItem {
  id: string;
  units: number;
  type: string;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  length: number;
  width: number;
  height: number;
  dimUnit: 'in' | 'cm';
  nmfcClass: string;
  commodity: string;
  autoCalculatedClass?: boolean;
}

export interface QuoteRequestPayload {
  pickupLocation: string;
  pickupZip: string;
  pickupCity?: string;
  pickupState?: string;
  pickupCountry?: 'US' | 'CA';
  deliveryLocation: string;
  deliveryZip: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryCountry?: 'US' | 'CA';
  pickupDate?: string;
  accessorials: string[];
  lineItems: LineItem[];
  cargoValue?: number;
  billingReference?: string;
}

export interface CarrierQuote {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierLogo?: string;
  carrierCode?: string;
  serviceClass: string; // e.g. "Standard LTL", "Guaranteed 12:00 PM", "Guaranteed Day"
  transitDays: number;
  estDeliveryDate: string;
  liability: string; // e.g. "$25.00 / lb"
  pickupPerformance: number; // e.g. 98.4
  deliveryPerformance: number; // e.g. 96.8
  quoteExpirationDate: string;
  notes: string; // Rate including pickup notes
  finalRate: number; // Customer price after mandatory markup
  finalRateWithInsurance: number; // Customer price with cargo insurance
  insuranceCost: number;
  currency: string;
}

export interface QuoteResult {
  quoteToken: string;
  createdAt: string;
  expiresAt: string;
  payload: QuoteRequestPayload;
  totalWeightLbs: number;
  totalUnits: number;
  carriers: CarrierQuote[];
  status: 'active' | 'expired' | 'booked';
}

export interface SystemStatus {
  service: string;
  portalUrl: string;
  credentialsConfigured: boolean;
  emailMasked?: string;
  sessionActive: boolean;
  lastLoginTime?: string;
  environment: string;
  platform: string;
  message?: string;
  accountName?: string;
  authMethod?: string;
}

export interface LocationSuggestion {
  zip: string;
  city: string;
  state: string;
  formatted: string;
}

export interface AccessorialsCatalog {
  common: string[];
  general: string[];
  origin: string[];
  delivery: string[];
}
