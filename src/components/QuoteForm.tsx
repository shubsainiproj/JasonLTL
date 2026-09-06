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
} from 'lucide-react';
import { LineItem, QuoteRequestPayload } from '../types';
import { LocationAutocomplete } from './LocationAutocomplete';
import { LineItemsEditor } from './LineItemsEditor';

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

  // Clean empty state for manual user entry
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupZip, setPickupZip] = useState('');

  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryZip, setDeliveryZip] = useState('');

  const [pickupDate, setPickupDate] = useState(defaultDate);
  const [selectedAccessorials, setSelectedAccessorials] = useState<string[]>([]);

  // Clean initial line item ready for manual entry
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
    },
  ]);

  const [showOptional, setShowOptional] = useState(false);
  const [cargoValue, setCargoValue] = useState<number | undefined>(undefined);
  const [billingReference, setBillingReference] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Rotating facts state
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    let factInterval: any;
    if (loading) {
      factInterval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % JASON_LTL_FACTS_AND_IDIOMS.length);
      }, 2600);
    }
    return () => clearInterval(factInterval);
  }, [loading]);

  const handleSwapLocations = () => {
    const tempLoc = pickupLocation;
    const tempZip = pickupZip;
    setPickupLocation(deliveryLocation);
    setPickupZip(deliveryZip);
    setDeliveryLocation(tempLoc);
    setDeliveryZip(tempZip);
  };

  const toggleQuickAccessorial = (name: string) => {
    if (selectedAccessorials.includes(name)) {
      setSelectedAccessorials(selectedAccessorials.filter((item) => item !== name));
    } else {
      setSelectedAccessorials([...selectedAccessorials, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanPickupZip = pickupZip.trim();
    if (!cleanPickupZip || cleanPickupZip.length < 5) {
      setValidationError('Please enter a valid 5-digit origin / pickup ZIP code.');
      return;
    }

    const cleanDeliveryZip = deliveryZip.trim();
    if (!cleanDeliveryZip || cleanDeliveryZip.length < 5) {
      setValidationError('Please enter a valid 5-digit destination / delivery ZIP code.');
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
      deliveryLocation: deliveryLocation.trim() || `ZIP ${cleanDeliveryZip}`,
      deliveryZip: cleanDeliveryZip,
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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Origin & Destination Routing */}
      <div className="glass p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
              1. Origin &amp; Destination Routing
            </h2>
          </div>
          <span className="tag-neon text-[11px] font-mono hidden sm:inline-flex">
            Direct Terminal Interconnect
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-end">
          {/* Origin / Pickup Location Autocomplete */}
          <div className="md:col-span-5">
            <LocationAutocomplete
              id="input-pickup-location"
              label="Pickup Location / Zip Code"
              value={pickupLocation}
              zipValue={pickupZip}
              required
              placeholder="Enter 5-digit ZIP or City, State"
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
              className="p-3 rounded-xl bg-white/[0.04] hover:bg-yellow-400/15 border border-white/[0.1] hover:border-yellow-400/40 text-slate-300 hover:text-[#FACC15] transition-all cursor-pointer shadow-sm"
              title="Swap Origin and Destination"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination / Delivery Location Autocomplete */}
          <div className="md:col-span-5">
            <LocationAutocomplete
              id="input-delivery-location"
              label="Delivery Location / Zip Code"
              value={deliveryLocation}
              zipValue={deliveryZip}
              required
              placeholder="Enter 5-digit ZIP or City, State"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Pickup Ready Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="glass-input w-full px-3.5 py-3 rounded-lg text-sm text-white font-medium cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Line Items Section (Freight Specifications) */}
      <div className="glass p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
              2. Freight Specifications &amp; NMFC Classes
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
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

      {/* 3. Enhanced Accessorial & PTL Advisory Card */}
      <div className="glass-yellow p-5 sm:p-6 space-y-4 relative overflow-hidden transition-all">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-[#FACC15] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                Accessorials &amp; Direct Transit Advisory
                <span className="tag-yellow text-[10px]">Cost-Optimized</span>
              </h3>
              <p className="text-xs text-slate-400">
                Transparent guidance for appointments, dock handling, and equipment
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#05070A]/70 border border-white/[0.08] text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2.5">
          <p>
            <strong className="text-[#FACC15] font-bold">Cost Transparency:</strong> Standard accessorials generally carry minimal cost impact unless strict appointment deliveries or specialized hydraulic liftgates are required.
          </p>
          <p className="text-slate-300">
            For strict delivery appointment windows or high-volume shipments, we frequently coordinate <span className="text-[#38BDF8] font-bold">PTL (Partial Truckload)</span>. PTL eliminates multi-hub cross-docking, ensures direct point-to-point transit, reduces freight handling risks to zero, and guarantees exact appointment delivery without costly penalty fees.
          </p>
        </div>

        {/* Optional Clean Add-on Toggles */}
        <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-slate-300 text-xs font-semibold mr-1">Optional Requirements:</span>
          <button
            type="button"
            onClick={() => toggleQuickAccessorial('Liftgate Delivery')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
              selectedAccessorials.includes('Liftgate Delivery')
                ? 'bg-yellow-400/20 text-[#FACC15] border-yellow-400/50 shadow-sm'
                : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:border-white/[0.2]'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${selectedAccessorials.includes('Liftgate Delivery') ? 'text-[#FACC15]' : 'opacity-30'}`} />
            <span>Liftgate Delivery</span>
          </button>
          <button
            type="button"
            onClick={() => toggleQuickAccessorial('Appointment Delivery')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
              selectedAccessorials.includes('Appointment Delivery')
                ? 'bg-yellow-400/20 text-[#FACC15] border-yellow-400/50 shadow-sm'
                : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:border-white/[0.2]'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${selectedAccessorials.includes('Appointment Delivery') ? 'text-[#FACC15]' : 'opacity-30'}`} />
            <span>Strict Appointment Window (PTL Recommended)</span>
          </button>
          <button
            type="button"
            onClick={() => toggleQuickAccessorial('Inside Delivery')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
              selectedAccessorials.includes('Inside Delivery')
                ? 'bg-yellow-400/20 text-[#FACC15] border-yellow-400/50 shadow-sm'
                : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:border-white/[0.2]'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${selectedAccessorials.includes('Inside Delivery') ? 'text-[#FACC15]' : 'opacity-30'}`} />
            <span>Inside Delivery</span>
          </button>
        </div>
      </div>

      {/* 4. Optional Cargo Value & Billing Ref Accordion */}
      <div className="glass p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-[#FACC15] font-extrabold text-base">+</span>
            <span>Optional Declared Cargo Value &amp; Shipper Reference / PO</span>
          </div>
          {showOptional ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showOptional && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-3 border-t border-white/[0.08] animate-in fade-in duration-150">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1.5">
                Declared Cargo Value ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={cargoValue !== undefined ? cargoValue : ''}
                  onChange={(e) => setCargoValue(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g. 15000"
                  className="glass-input w-full pl-8 pr-3.5 py-2.5 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1.5">
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
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start space-x-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold uppercase tracking-wider text-xs text-rose-300">Notice</div>
            <p>{sanitizeNoticeText(validationError || error)}</p>
          </div>
        </div>
      )}

      {/* Dynamic Jason LTL Loading Box with Rotating Idioms, News & Appreciations */}
      {loading && (
        <div className="p-6 sm:p-7 rounded-2xl bg-black/90 border border-yellow-400/40 shadow-2xl text-slate-200 space-y-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.1] pb-3.5">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-[#FACC15] animate-ping" />
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">
                JASON LTL &bull; DIRECT CARRIER TARIFF SCAN
              </span>
            </div>
            <span className="tag-yellow text-xs font-mono">
              Insight {currentFactIndex + 1} of {JASON_LTL_FACTS_AND_IDIOMS.length}
            </span>
          </div>

          {/* Dynamic Rotating Fact & Idiom Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.03] border border-white/[0.1] space-y-2 transition-all duration-300">
            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#FACC15] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/30">
                {currentFact.tag}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white">
                {currentFact.title}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed italic">
              {currentFact.text}
            </p>
          </div>

          {/* Animated Gradient Progress Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Scanning live carrier tariffs across 30+ top North American freight carriers...</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Direct Execution
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden relative border border-white/[0.08]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15] via-yellow-200 to-[#38BDF8] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

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
              <span>Scanning Carrier Tariffs...</span>
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
