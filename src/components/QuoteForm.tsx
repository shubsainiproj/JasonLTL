import React, { useState, useEffect } from 'react';
import {
  Truck,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Activity,
  ShieldCheck,
  Sparkles,
  Check,
  Layers,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';
import { LineItem, QuoteRequestPayload } from '../types';
import { LocationAutocomplete } from './LocationAutocomplete';
import { LineItemsEditor } from './LineItemsEditor';
import { MoreAccessorialsModal } from './MoreAccessorialsModal';
import {
  PRIMARY_ORIGIN_ACCESSORIALS,
  PRIMARY_DELIVERY_ACCESSORIALS,
  PRIMARY_GENERAL_ACCESSORIALS,
  ACCESSORIAL_ID_MAP,
} from '../data/accessorialsData';

interface QuoteFormProps {
  onSubmitQuote: (payload: QuoteRequestPayload) => Promise<void>;
  loading: boolean;
  commonAccessorials: string[];
  generalAccessorials: string[];
  originAccessorials: string[];
  deliveryAccessorials: string[];
  nmfcClasses: string[];
  packageTypes: string[];
  error?: string | null;
}

const JASON_LTL_FACTS_AND_IDIOMS = [
  {
    tag: 'JASON LTL CAPABILITY',
    title: 'Did you know you can now...?',
    text: 'Access end-to-end transportation solutions across all 50 US states and cross-border Canada with direct dispatch.',
  },
  {
    tag: 'FREIGHT ETHOS',
    title: 'The Real Value',
    text: '"Freight is easy when everything goes right. The real value comes when challenges arise. That’s where we deliver."',
  },
  {
    tag: 'DIRECT EXECUTION',
    title: 'Zero Double Brokering',
    text: 'No double brokering. No ghost carriers. No excuses. Just reliable freight execution and consistent communication.',
  },
  {
    tag: 'PORT & RAIL DRAYAGE',
    title: 'Did you know you can now...?',
    text: 'Coordinate Container Drayage directly from major ocean ports and rail ramps with swift chassis turnaround.',
  },
  {
    tag: 'CARRIER NETWORKS',
    title: 'Major Freight Networks',
    text: 'Direct compliant appointment scheduling for Amazon, Uber Freight, FedEx, DHL, and premier national LTL freight networks.',
  },
  {
    tag: 'SAFETY & COMPLIANCE',
    title: 'HazMat Logistics',
    text: 'Did you know Jason LTL handles fully certified Hazardous Materials (HazMat) transit with dedicated safety compliance?',
  },
  {
    tag: 'COLD CHAIN TRANSIT',
    title: 'Did you know you can now...?',
    text: 'Dispatch Temperature-Controlled Reefer transport for perishable, ambient, and climate-sensitive freight.',
  },
  {
    tag: 'EXPEDITED FREIGHT',
    title: 'Airport Recoveries',
    text: 'Direct airport pickups and expedited tarmac-to-dock recovery for urgent domestic and international air cargo.',
  },
  {
    tag: 'FREIGHT IDIOM',
    title: 'Logistics Wisdom',
    text: '"A smooth sea never made a skilled sailor." When road conditions or terminal docks bottleneck, our team steps in immediately.',
  },
  {
    tag: 'TOTAL CAPACITY',
    title: 'Versatility Guarantee',
    text: 'If it moves, we can move it — from single-pallet LTL to multi-trailer OTR freight (FTL / PTL / Expedited).',
  },
  {
    tag: 'COMMUNICATION',
    title: 'Consistent Updates',
    text: 'No automated phone loops. You receive direct, proactive milestone updates from initial pickup to final Proof of Delivery.',
  },
  {
    tag: 'TARIFF EFFICIENCY',
    title: 'Did you know you can now...?',
    text: 'Compare live terminal tariffs across 30+ top tier regional and national carriers simultaneously in real-time.',
  },
  {
    tag: 'FREIGHT IDIOM',
    title: 'Industry Proverb',
    text: '"An ounce of prevention is worth a pound of cure." Rigorous carrier safety audits ensure cargo integrity on every single mile.',
  },
  {
    tag: 'DENSITY & CLASSIFICATION',
    title: 'Pro Shipper Tip',
    text: 'Did you know? Precise density calculations protect your shipment against carrier re-weigh and NMFC re-classification surcharges.',
  },
  {
    tag: 'DISTRIBUTION HUBS',
    title: 'Retail Appointments',
    text: 'Guaranteed compliant dock delivery appointments for Walmart, Target, Home Depot, and Costco distribution hubs.',
  },
  {
    tag: 'PACKAGING INSIGHT',
    title: 'Damage Prevention',
    text: 'Proper corner-board protection and heavy stretch-wrapping reduce handling transit claims by up to 92%.',
  },
  {
    tag: 'CROSS-BORDER',
    title: 'Canada Interconnect',
    text: 'Bonded transit and rapid customs clearance through major commercial border crossings across Ontario, Quebec, and Western Canada.',
  },
  {
    tag: 'SHIPPER APPRECIATION',
    title: 'Valued Partnership',
    text: 'Thank you for choosing Jason LTL. We treat every pallet and trailer with the personal dedication your business deserves.',
  },
  {
    tag: 'CARGO PROTECTION',
    title: 'Declared Value Insurance',
    text: 'Did you know you can now add instant full declared cargo value insurance to safeguard high-value merchandise?',
  },
  {
    tag: 'FREIGHT IDIOM',
    title: 'Logistics Proverb',
    text: '"Actions speak louder than words." We measure our success by on-time delivery percentages, not empty promises.',
  },
  {
    tag: 'ACCESSORIAL ADAPTABILITY',
    title: 'Custom Delivery',
    text: 'From hydraulic liftgates to inside deliveries and construction sites, we match equipment to your exact destination requirements.',
  },
  {
    tag: 'QUOTE SECURITY',
    title: '7-Day Tariff Lock',
    text: 'Every quote reference is locked and accessible for one-click re-calculation or instant dispatch scheduling.',
  },
  {
    tag: 'FREIGHT IDIOM',
    title: 'Road Lore',
    text: '"Keep on trucking." American freight keeps our economy rolling, and Jason LTL is proud to keep your supply chain moving.',
  },
  {
    tag: 'GREEN LOGISTICS',
    title: 'Eco Consolidation',
    text: 'Did you know? Optimized LTL freight consolidation reduces carbon emissions per ton-mile by over 45% compared to dedicated vans.',
  },
  {
    tag: 'EXPERIENCED DISPATCH',
    title: 'Craftsmanship & Integrity',
    text: 'Decades of freight operational experience behind every load. No guesswork, no rookie dispatchers — pure logistics expertise.',
  },
];

export const QuoteForm: React.FC<QuoteFormProps> = ({
  onSubmitQuote,
  loading,
  nmfcClasses,
  packageTypes,
  error,
}) => {
  // Tomorrow's date as default pickup date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  // Routing State
  const [pickupCountry, setPickupCountry] = useState<'US' | 'CA'>('US');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupZip, setPickupZip] = useState('');

  const [deliveryCountry, setDeliveryCountry] = useState<'US' | 'CA'>('US');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryZip, setDeliveryZip] = useState('');

  const [pickupDate, setPickupDate] = useState(defaultDate);

  // Accessorials State (stores string IDs matching API specification)
  const [selectedAccessorials, setSelectedAccessorials] = useState<string[]>([]);
  const [moreModalOpen, setMoreModalOpen] = useState(false);

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 'item-1',
      units: 1,
      type: 'Pallets',
      weight: '' as any,
      weightUnit: 'lbs',
      length: '' as any,
      width: '' as any,
      height: '' as any,
      dimUnit: 'in',
      nmfcClass: '70',
      commodity: '',
      autoCalculatedClass: true,
    },
  ]);

  const [showOptional, setShowOptional] = useState(false);
  const [cargoValue, setCargoValue] = useState<number | undefined>(undefined);
  const [billingReference, setBillingReference] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Rotating facts and scan timer state
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let factInterval: any;
    let timerInterval: any;

    if (loading) {
      setElapsedSeconds(0);
      timerInterval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      factInterval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % JASON_LTL_FACTS_AND_IDIOMS.length);
      }, 2600);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      clearInterval(factInterval);
      clearInterval(timerInterval);
    };
  }, [loading]);

  const handleSwapLocations = () => {
    const tempCountry = pickupCountry;
    const tempLoc = pickupLocation;
    const tempZip = pickupZip;

    setPickupCountry(deliveryCountry);
    setPickupLocation(deliveryLocation);
    setPickupZip(deliveryZip);

    setDeliveryCountry(tempCountry);
    setDeliveryLocation(tempLoc);
    setDeliveryZip(tempZip);
  };

  const toggleAccessorial = (id: string) => {
    if (selectedAccessorials.includes(id)) {
      setSelectedAccessorials(selectedAccessorials.filter((item) => item !== id));
    } else {
      setSelectedAccessorials([...selectedAccessorials, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanPickupZip = pickupZip.trim();
    if (!cleanPickupZip) {
      setValidationError('Please enter a valid origin / pickup postal code or ZIP.');
      return;
    }
    if (pickupCountry === 'US' && cleanPickupZip.length < 5) {
      setValidationError('Please enter a valid 5-digit US origin ZIP code.');
      return;
    }
    if (pickupCountry === 'CA' && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(cleanPickupZip)) {
      setValidationError('Please enter a valid Canadian postal code (e.g. M1R 0E9) for Origin.');
      return;
    }

    const cleanDeliveryZip = deliveryZip.trim();
    if (!cleanDeliveryZip) {
      setValidationError('Please enter a valid destination / delivery postal code or ZIP.');
      return;
    }
    if (deliveryCountry === 'US' && cleanDeliveryZip.length < 5) {
      setValidationError('Please enter a valid 5-digit US destination ZIP code.');
      return;
    }
    if (deliveryCountry === 'CA' && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(cleanDeliveryZip)) {
      setValidationError('Please enter a valid Canadian postal code (e.g. M1R 0E9) for Destination.');
      return;
    }

    if (!lineItems || lineItems.length === 0) {
      setValidationError('Please add at least one line item to quote.');
      return;
    }

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      if (!item.commodity || item.commodity.trim().length === 0) {
        setValidationError(`Line Item #${i + 1}: Please enter a commodity description.`);
        return;
      }
      const unitsNum = Number(item.units);
      if (!unitsNum || unitsNum < 1) {
        setValidationError(`Line Item #${i + 1}: Units must be at least 1.`);
        return;
      }
      const weightNum = Number(item.weight);
      if (!weightNum || weightNum <= 0) {
        setValidationError(`Line Item #${i + 1}: Please enter a valid weight greater than 0.`);
        return;
      }
    }

    const payload: QuoteRequestPayload = {
      pickupLocation: pickupLocation.trim() || `ZIP ${cleanPickupZip}`,
      pickupZip: cleanPickupZip,
      pickupCountry,
      deliveryLocation: deliveryLocation.trim() || `ZIP ${cleanDeliveryZip}`,
      deliveryZip: cleanDeliveryZip,
      deliveryCountry,
      pickupDate,
      accessorials: selectedAccessorials,
      lineItems: lineItems.map((it) => ({
        ...it,
        units: Number(it.units) || 1,
        weight: Number(it.weight) || 100,
        length: Number(it.length) || 48,
        width: Number(it.width) || 40,
        height: Number(it.height) || 48,
      })),
      cargoValue: cargoValue ? Number(cargoValue) : undefined,
      billingReference: billingReference.trim() || undefined,
    };

    await onSubmitQuote(payload);
  };

  const currentFact = JASON_LTL_FACTS_AND_IDIOMS[currentFactIndex];

  const sanitizeNoticeText = (msg: string | null | undefined): string => {
    if (!msg) return '';
    return msg
      .replace(/GLT live rating engine/gi, 'Direct carrier rating engine')
      .replace(/GLT/gi, 'Direct')
      .replace(/goglt\.com/gi, 'jasonltl.com')
      .replace(/myportal/gi, 'portal');
  };

  // Count accessorials beyond primary ones
  const primaryIds = new Set([
    ...PRIMARY_ORIGIN_ACCESSORIALS.map((a) => a.id),
    ...PRIMARY_DELIVERY_ACCESSORIALS.map((a) => a.id),
    ...PRIMARY_GENERAL_ACCESSORIALS.map((a) => a.id),
  ]);
  const moreSelectedCount = selectedAccessorials.filter((id) => !primaryIds.has(id)).length;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-6">
      {/* More Accessorials Modal */}
      <MoreAccessorialsModal
        isOpen={moreModalOpen}
        onClose={() => setMoreModalOpen(false)}
        selectedIds={selectedAccessorials}
        onToggle={toggleAccessorial}
      />

      {/* 1. Origin & Destination Routing with Country Select Option */}
      <div className="glass p-6 sm:p-7 space-y-5 stops">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 dark:bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Origin &amp; Destination Routing
            </h2>
          </div>
          <span className="tag-neon text-[11px] font-mono hidden sm:inline-flex">
            US &amp; Cross-Border Canada
          </span>
        </div>

        <div className="stops-container grid grid-cols-1 md:grid-cols-11 gap-4 items-end">
          {/* Origin / Pickup Location with Country Select */}
          <div className="md:col-span-5 stop-selector-wrapper">
            <LocationAutocomplete
              id="input-pickup-location"
              label="Pickup Location / Zip Code"
              value={pickupLocation}
              zipValue={pickupZip}
              country={pickupCountry}
              onCountryChange={setPickupCountry}
              required
              onChange={(loc, zip) => {
                setPickupLocation(loc);
                setPickupZip(zip);
              }}
            />
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              id="btn-swap-locations"
              type="button"
              onClick={handleSwapLocations}
              className="p-3 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-yellow-400/20 border border-slate-200 dark:border-white/[0.1] hover:border-yellow-400 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-[#FACC15] transition-all cursor-pointer shadow-sm"
              title="Swap Origin and Destination"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination / Delivery Location with Country Select */}
          <div className="md:col-span-5 stop-selector-wrapper">
            <LocationAutocomplete
              id="input-delivery-location"
              label="Delivery Location / Zip Code"
              value={deliveryLocation}
              zipValue={deliveryZip}
              country={deliveryCountry}
              onCountryChange={setDeliveryCountry}
              required
              onChange={(loc, zip) => {
                setDeliveryLocation(loc);
                setDeliveryZip(zip);
              }}
            />
          </div>
        </div>

        {/* Pickup Date Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Pickup Ready Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="glass-input w-full px-3.5 py-3 rounded-lg text-sm text-slate-900 dark:text-white font-medium cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Line Items Section with AUTO CALCULATE CLASS */}
      <div className="glass p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 dark:bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              2. Freight Specifications &amp; NMFC Classes
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {lineItems.length} Line Item{lineItems.length === 1 ? '' : 's'}
          </span>
        </div>

        <LineItemsEditor
          items={lineItems}
          onChange={setLineItems}
          nmfcClasses={nmfcClasses}
          packageTypes={packageTypes}
        />
      </div>

      {/* 3. ACCESSORIALS SECTION (Matching Reference Structure) */}
      <div className="glass p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. Accessorials &amp; Handling Options
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select equipment, dock, and delivery handling requirements
              </p>
            </div>
          </div>

          {/* More Accessorials Button */}
          <button
            id="more-accessorials"
            type="button"
            onClick={() => setMoreModalOpen(true)}
            className="row-accessorials__button flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.12] hover:border-yellow-400/60 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-500 dark:text-[#FACC15]" />
            <span>More Accessorials</span>
            {moreSelectedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-mono text-[10px] font-bold">
                +{moreSelectedCount}
              </span>
            )}
          </button>
        </div>

        {/* Row of Origin vs Delivery Accessorials */}
        <div className="row-accessorials__row grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin / Pickup Options */}
          <div className="row-accessorials__information p-4 rounded-xl bg-slate-50/80 dark:bg-[#0B0F17]/60 border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="text-xs font-bold text-sky-600 dark:text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
              <span>Pickup Accessorials</span>
            </div>
            <div className="space-y-2">
              {PRIMARY_ORIGIN_ACCESSORIALS.map((acc) => {
                const checked = selectedAccessorials.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    htmlFor={acc.id}
                    className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                      checked
                        ? 'bg-yellow-400/15 border-yellow-400/50 text-slate-900 dark:text-white font-semibold'
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      id={acc.id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAccessorial(acc.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        checked
                          ? 'bg-yellow-400 border-yellow-400 text-slate-950'
                          : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-black/40'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs">{acc.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Delivery Options */}
          <div className="row-accessorials__information p-4 rounded-xl bg-slate-50/80 dark:bg-[#0B0F17]/60 border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="text-xs font-bold text-sky-600 dark:text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
              <span>Delivery Accessorials</span>
            </div>
            <div className="space-y-2">
              {PRIMARY_DELIVERY_ACCESSORIALS.map((acc) => {
                const checked = selectedAccessorials.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    htmlFor={acc.id}
                    className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                      checked
                        ? 'bg-yellow-400/15 border-yellow-400/50 text-slate-900 dark:text-white font-semibold'
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      id={acc.id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAccessorial(acc.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        checked
                          ? 'bg-yellow-400 border-yellow-400 text-slate-950'
                          : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-black/40'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs">{acc.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* General Accessorials Container */}
        <div className="general-accessorials-container p-4 rounded-xl bg-slate-50/80 dark:bg-[#0B0F17]/60 border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-sm">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            General Handling Requirements
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRIMARY_GENERAL_ACCESSORIALS.map((acc) => {
              const checked = selectedAccessorials.includes(acc.id);
              return (
                <label
                  key={acc.id}
                  htmlFor={acc.id}
                  className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                    checked
                      ? 'bg-yellow-400/15 border-yellow-400/50 text-slate-900 dark:text-white font-semibold'
                      : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    id={acc.id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAccessorial(acc.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      checked
                        ? 'bg-yellow-400 border-yellow-400 text-slate-950'
                        : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-black/40'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs">{acc.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Accessorial & PTL Transit Advisory Card */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-yellow-400/5 border border-amber-200 dark:border-yellow-400/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong className="text-amber-800 dark:text-[#FACC15] font-bold">Cost Transparency:</strong> Standard accessorials carry minimal cost impact unless strict appointments or specialized hydraulic equipment are required.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            For strict delivery appointment windows or high-volume freight, we recommend <strong className="text-sky-700 dark:text-[#38BDF8]">PTL (Partial Truckload)</strong> to avoid multi-hub cross-docking and guarantee direct appointment delivery.
          </p>
        </div>
      </div>

      {/* 4. Optional Cargo Value & Billing Ref Accordion */}
      <div className="glass p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-yellow-600 dark:text-[#FACC15] font-extrabold text-base">+</span>
            <span>Optional Declared Cargo Value &amp; Shipper Reference / PO</span>
          </div>
          {showOptional ? (
            <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          )}
        </button>

        {showOptional && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-3 border-t border-slate-200 dark:border-white/[0.08] animate-in fade-in duration-150">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Declared Cargo Value ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={cargoValue !== undefined ? cargoValue : ''}
                  onChange={(e) =>
                    setCargoValue(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="e.g. 15000"
                  className="glass-input w-full pl-8 pr-3.5 py-2.5 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Shipper Reference / PO Number
              </label>
              <input
                type="text"
                value={billingReference}
                onChange={(e) => setBillingReference(e.target.value)}
                placeholder="e.g. PO-88219"
                className="glass-input w-full px-3.5 py-2.5 rounded-lg text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Displays */}
      {(validationError || error) && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start space-x-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold uppercase tracking-wider text-xs text-rose-700 dark:text-rose-300">Notice</div>
            <p>{sanitizeNoticeText(validationError || error)}</p>
          </div>
        </div>
      )}

      {/* Dynamic Jason LTL Loading Box with Rotating Idioms & News */}
      {loading && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-[#0B0F17]/95 border border-yellow-400/50 shadow-2xl text-slate-800 dark:text-slate-200 space-y-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.1] pb-3.5">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-[#FACC15] animate-ping" />
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                JASON LTL &bull; DIRECT CARRIER TARIFF SCAN
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-yellow-800 dark:text-yellow-400 font-bold bg-yellow-400/20 px-2.5 py-0.5 rounded border border-yellow-400/40">
                {elapsedSeconds}s / 120s
              </span>
              <span className="tag-yellow text-xs font-mono">
                Insight {currentFactIndex + 1} of {JASON_LTL_FACTS_AND_IDIOMS.length}
              </span>
            </div>
          </div>

          {/* Dynamic Rotating Fact & Idiom Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.1] space-y-2 transition-all duration-300">
            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-yellow-800 dark:text-[#FACC15] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                {currentFact.tag}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {currentFact.title}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-100 font-medium leading-relaxed italic">
              {currentFact.text}
            </p>
          </div>

          {/* Animated Gradient Progress Bar with Live Scan Stage */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                {elapsedSeconds < 15
                  ? 'Connecting to carrier network & validating lane...'
                  : elapsedSeconds < 40
                  ? 'Querying Estes, TForce, ABF, Forward Air, FedEx...'
                  : elapsedSeconds < 75
                  ? 'Calculating live fuel surcharges, density & accessorials...'
                  : elapsedSeconds < 100
                  ? 'Verifying dimensional tariffs & carrier liability...'
                  : 'Finalizing lowest guaranteed carrier rates & markup matrix...'}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 shrink-0 ml-2">
                <ShieldCheck className="w-4 h-4" /> Direct Execution
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden relative border border-slate-300 dark:border-white/[0.08]">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-300 to-sky-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(98, Math.max(6, Math.round((elapsedSeconds / 120) * 100)))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>Scanning up to 30+ top North American freight carriers</span>
              <span>120s deep tariff scan window</span>
            </div>
          </div>
        </div>
      )}

      {/* 120s Lane Scan Notice & Carrier Tariff Guarantee Note */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50 dark:bg-blue-950/25 border border-sky-200 dark:border-sky-500/25 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
        <div className="flex items-center space-x-2 text-sky-700 dark:text-[#38BDF8] font-bold uppercase tracking-wider text-[11px]">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Carrier Rating Engine Notice &bull; Real-Time Tariff Scan</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Some freight lanes (including remote terminals, cross-border US-Canada routes, and interline service points) can take up to <strong>120 seconds</strong> to aggregate certified rate quotes from all 30+ carrier systems. We keep scanning until the lowest rates and earliest transit times are retrieved.
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          id="btn-submit-quote"
          type="submit"
          disabled={loading}
          className="w-full py-4 px-8 rounded-xl btn-yellow disabled:opacity-50 text-base sm:text-lg uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-2.5 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-black" />
              <span>Scanning Carrier Tariffs ({elapsedSeconds}s)...</span>
            </>
          ) : (
            <>
              <Truck className="w-5 h-5 text-black" />
              <span>GET FREIGHT QUOTES</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 mt-2.5 tracking-wide">
          Direct North American Freight Network &bull; Guaranteed Door-to-Door Pricing &bull; No Double Brokering
        </p>
      </div>
    </form>
  );
};
