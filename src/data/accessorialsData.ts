/**
 * Accessorial definitions and IDs matching carrier network rating specifications.
 */

export interface AccessorialItem {
  id: string; // Numeric ID from API
  name: string;
  category: 'origin' | 'delivery' | 'general';
  requiresEmailQuote?: boolean;
  description?: string;
}

// 1. Primary Quick Accessorials (Shown directly on the form)
export const PRIMARY_ORIGIN_ACCESSORIALS: AccessorialItem[] = [
  { id: '4', name: 'CFS Pick Up', category: 'origin' },
  { id: '19', name: 'Liftgate Pick Up', category: 'origin' },
  { id: '21', name: 'Residential Pick Up', category: 'origin' },
];

export const PRIMARY_DELIVERY_ACCESSORIALS: AccessorialItem[] = [
  { id: '3', name: 'CFS Delivery', category: 'delivery' },
  { id: '18', name: 'Liftgate Delivery', category: 'delivery' },
  { id: '20', name: 'Residential Delivery', category: 'delivery' },
];

export const PRIMARY_GENERAL_ACCESSORIALS: AccessorialItem[] = [
  { id: '29', name: 'Hazmat', category: 'general' },
  { id: '15', name: 'Non Stackable', category: 'general' },
  { id: '41', name: 'Stackable', category: 'general' },
];

// 2. All Accessorials available under "More Accessorials" modal
export const MORE_GENERAL_ACCESSORIALS: AccessorialItem[] = [
  { id: '40', name: 'Air Ride truck', category: 'general' },
  { id: '16', name: 'Bonded', category: 'general' },
  { id: '39', name: 'Bonded + Form 7512', category: 'general', requiresEmailQuote: true },
  { id: '100', name: 'Double Blind', category: 'general' },
  { id: '80', name: 'Envelope(s)', category: 'general' },
  { id: '14', name: 'Guaranteed transit time', category: 'general' },
  { id: '11', name: 'Guns handling license', category: 'general', requiresEmailQuote: true },
  { id: '103', name: 'Hazmat 2.3', category: 'general' },
  { id: '28', name: 'Hazmat Explosives 1.4', category: 'general', requiresEmailQuote: true },
  { id: '34', name: 'Hazmat Toxic or Poison 6.1', category: 'general' },
  { id: '63', name: 'Household Goods', category: 'general' },
  { id: '43', name: 'Liquids', category: 'general' },
  { id: '17', name: 'Liquor Handling License', category: 'general' },
  { id: '79', name: 'Loose Boxes', category: 'general' },
  { id: '31', name: 'Packaging type: Bundle(s)', category: 'general' },
  { id: '30', name: 'Packaging type: Roll(s)', category: 'general' },
  { id: '32', name: 'Packaging type: Tube(s)', category: 'general' },
  { id: '53', name: 'Pallets-Crates-Skids', category: 'general' },
  { id: '33', name: 'Protect From Freezing', category: 'general' },
  { id: '8', name: 'Tobacco handling license', category: 'general', requiresEmailQuote: true },
  { id: '7', name: 'TSA Approved carrier', category: 'general' },
  { id: '54', name: 'Dock Height', category: 'general' },
  { id: '62', name: 'Free Insurance coverage', category: 'general' },
  { id: '57', name: 'Lock Bars', category: 'general' },
  { id: '56', name: 'Loose Cargo', category: 'general' },
  { id: '55', name: 'Straps', category: 'general' },
  { id: '69', name: 'TWIC Card', category: 'general' },
  { id: '42', name: 'Non Hazmat', category: 'general' },
  { id: '61', name: 'One day chassis discount', category: 'general' },
  { id: '71', name: 'Seafood', category: 'general' },
  { id: '75', name: 'Binders', category: 'general' },
  { id: '76', name: 'Tarp 4 ft', category: 'general' },
  { id: '77', name: 'Tarp 6 ft', category: 'general' },
  { id: '78', name: 'Tarp 8 ft', category: 'general' },
  { id: '124', name: 'Overweight', category: 'general' },
  { id: '123', name: 'Reefer', category: 'general' },
  { id: '125', name: 'Hazardous Material Handling', category: 'general' },
];

export const MORE_ORIGIN_ACCESSORIALS: AccessorialItem[] = [
  { id: '2', name: 'Airport Pick Up', category: 'origin' },
  { id: '10', name: 'Blind Pick Up', category: 'origin' },
  { id: '51', name: 'Distribution Center Pickup', category: 'origin' },
  { id: '25', name: 'Inside Pick Up', category: 'origin' },
  { id: '12', name: 'Jacinto Port Pickup', category: 'origin', requiresEmailQuote: true },
  { id: '23', name: 'Limited access Pick Up', category: 'origin' },
  { id: '44', name: 'Lumper Loading Assistance', category: 'origin' },
  { id: '6', name: 'Port Pick Up', category: 'origin' },
  { id: '58', name: 'Pickup Appointment', category: 'origin' },
  { id: '64', name: 'Wash out', category: 'origin' },
];

export const MORE_DELIVERY_ACCESSORIALS: AccessorialItem[] = [
  { id: '137', name: 'Adult Signature Required (Parcel)', category: 'delivery' },
  { id: '1', name: 'Airport Delivery', category: 'delivery' },
  { id: '26', name: 'Amazon Warehouse Delivery', category: 'delivery' },
  { id: '9', name: 'Blind Delivery', category: 'delivery' },
  { id: '47', name: 'Costco Delivery', category: 'delivery' },
  { id: '106', name: 'Curbside Delivery', category: 'delivery' },
  { id: '36', name: 'Delivery Appointment', category: 'delivery' },
  { id: '52', name: 'Distribution Center Delivery', category: 'delivery' },
  { id: '24', name: 'Inside Delivery', category: 'delivery' },
  { id: '13', name: 'Jacinto Port Delivery', category: 'delivery', requiresEmailQuote: true },
  { id: '22', name: 'Limited Access Delivery', category: 'delivery' },
  { id: '38', name: 'Lumper Unloading Assistance', category: 'delivery' },
  { id: '35', name: 'Pick Up at Carrier Destination Terminal', category: 'delivery' },
  { id: '5', name: 'Port Delivery', category: 'delivery' },
  { id: '138', name: 'Signature Required (Parcel)', category: 'delivery' },
  { id: '105', name: 'Threshold Delivery', category: 'delivery' },
  { id: '97', name: 'Trade Show Delivery', category: 'delivery', requiresEmailQuote: true },
  { id: '37', name: 'Walmart Delivery', category: 'delivery' },
  { id: '74', name: 'Airport delivery (TSA)', category: 'delivery' },
];

export const ALL_ACCESSORIALS: AccessorialItem[] = [
  ...PRIMARY_ORIGIN_ACCESSORIALS,
  ...PRIMARY_DELIVERY_ACCESSORIALS,
  ...PRIMARY_GENERAL_ACCESSORIALS,
  ...MORE_GENERAL_ACCESSORIALS,
  ...MORE_ORIGIN_ACCESSORIALS,
  ...MORE_DELIVERY_ACCESSORIALS,
];

// Helper lookups
export const ACCESSORIAL_ID_MAP = new Map<string, AccessorialItem>();
ALL_ACCESSORIALS.forEach((item) => {
  ACCESSORIAL_ID_MAP.set(item.id, item);
});

export const ACCESSORIAL_NAME_TO_ID: Record<string, string> = {};
ALL_ACCESSORIALS.forEach((item) => {
  ACCESSORIAL_NAME_TO_ID[item.name.toLowerCase()] = item.id;
});

// Excluded Commodities Standard Freight List
export interface ExcludedCommodity {
  name: string;
  reason: string;
}

export const EXCLUDED_COMMODITIES: ExcludedCommodity[] = [
  { name: 'Live Animals, Poultry & Reptiles', reason: 'Requires specialized livestock transit authority.' },
  { name: 'Currency, Coins, Bullion & Precious Metals', reason: 'High-theft cash equivalents are excluded by general tariff.' },
  { name: 'Explosives (Class 1.1, 1.2, 1.3 & Fireworks)', reason: 'Regulated hazardous materials prohibited in general LTL networks.' },
  { name: 'Human Remains & Cremated Remains', reason: 'Sanitary and statutory restrictions apply.' },
  { name: 'Untreated Radioactive Materials (Class 7)', reason: 'Severe contamination risk requiring dedicated government permits.' },
  { name: 'Unpackaged Original Fine Art & Antiques (> $50,000)', reason: 'High valuation requires dedicated white-glove fine art carriers.' },
  { name: 'Hazardous Waste (EPA Regulated RCRA)', reason: 'Carriers will not transport EPA manifested regulated waste.' },
  { name: 'Firearms & Ammunition without FFL Documentation', reason: 'Federal compliance forbids undocumented commercial firearms.' },
  { name: 'Biological Agents, Medical Waste & Cultures', reason: 'Biohazard risk requiring CDC-certified packaging.' },
  { name: 'Perishable Fresh Food (without reefer declaration)', reason: 'Spoilage risk in dry ambient trailer network.' },
];
