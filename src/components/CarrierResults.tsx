import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Copy,
  MapPin,
  Truck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CarrierQuote, QuoteResult } from '../types';

interface CarrierResultsProps {
  quote: QuoteResult;
  onBackToQuote: () => void;
  onBookCarrier: (carrier: CarrierQuote, withInsurance: boolean) => void;
}

export const CarrierResults: React.FC<CarrierResultsProps> = ({
  quote,
  onBackToQuote,
  onBookCarrier,
}) => {
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'performance'>('price');
  const [copiedToken, setCopiedToken] = useState(false);
  const [showSpecDetails, setShowSpecDetails] = useState(true);

  const copyShareLink = () => {
    const url = `${window.location.origin}#quote=${quote.quoteToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const sortedCarriers = [...quote.carriers].sort((a, b) => {
    if (sortBy === 'price') return a.finalRate - b.finalRate;
    if (sortBy === 'transit') return a.transitDays - b.transitDays;
    if (sortBy === 'performance') return b.deliveryPerformance - a.deliveryPerformance;
    return 0;
  });

  const primaryLineItem = quote.payload.lineItems[0] || {
    commodity: 'General Merchandise',
    units: 1,
    weight: quote.totalWeightLbs,
    nmfcClass: '70',
    type: 'Pallet',
  };

  const additionalItemsCount = quote.payload.lineItems.length - 1;

  return (
    <div className="w-full max-w-full space-y-5 animate-in fade-in duration-200 overflow-x-hidden">
      {/* =========================================================================
          TOP SECTION: SHIPMENT DETAILS & LANE OVERVIEW (CLEAN FULL-WIDTH HEADER)
          Auto-adjusts neatly at all zoom levels (70% - 200%) without squeezing cards.
          ========================================================================= */}
      <section className="w-full glass rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/[0.09] space-y-3.5 shadow-xl bg-white/95 dark:bg-[#080C14]/90">
        {/* Header Bar: Status, Actions, Spec Editor & Share */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-700 dark:text-[#FACC15] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Shipment Specification &amp; Lane Overview
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-sky-600 dark:text-[#38BDF8] font-bold">
              #{quote.quoteToken}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Tariff Rate Lock Badge */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] sm:text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Valid 7 Days Guaranteed</span>
            </div>

            {/* Share Link Button */}
            <button
              id="btn-copy-token"
              type="button"
              onClick={copyShareLink}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium text-xs"
              title="Copy link to this quote"
            >
              {copiedToken ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-yellow-600 dark:text-[#FACC15]" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Edit Spec Button */}
            <button
              id="btn-edit-parameters"
              type="button"
              onClick={onBackToQuote}
              className="px-2.5 py-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-800 dark:text-[#FACC15] font-bold transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Spec</span>
            </button>

            {/* Toggle Spec Collapse */}
            <button
              type="button"
              onClick={() => setShowSpecDetails(!showSpecDetails)}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] cursor-pointer"
              title={showSpecDetails ? "Collapse specifications" : "Expand specifications"}
            >
              {showSpecDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Route & Cargo Specifications Grid */}
        {showSpecDetails && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Origin Location */}
              <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1 min-w-0">
                <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>ORIGIN (PICKUP)</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate" title={quote.payload.pickupLocation}>
                  {quote.payload.pickupLocation}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                  <span className="font-mono text-sky-700 dark:text-[#38BDF8] font-semibold">ZIP {quote.payload.pickupZip}</span>
                  {quote.payload.pickupCity && <span>&bull; {quote.payload.pickupCity}, {quote.payload.pickupState}</span>}
                </div>
              </div>

              {/* Destination Location */}
              <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1 min-w-0">
                <div className="flex items-center space-x-1.5 text-[10px] text-sky-700 dark:text-sky-400 uppercase font-bold tracking-wider">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>DESTINATION (DELIVERY)</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate" title={quote.payload.deliveryLocation}>
                  {quote.payload.deliveryLocation}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                  <span className="font-mono text-sky-700 dark:text-[#38BDF8] font-semibold">ZIP {quote.payload.deliveryZip}</span>
                  {quote.payload.deliveryCity && <span>&bull; {quote.payload.deliveryCity}, {quote.payload.deliveryState}</span>}
                </div>
              </div>

              {/* Commodity & Classification */}
              <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1 min-w-0">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  COMMODITY &amp; CLASS
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate" title={primaryLineItem.commodity}>
                  {primaryLineItem.commodity}
                  {additionalItemsCount > 0 && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">(+{additionalItemsCount} more)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-[11px] pt-0.5">
                  <span className="text-slate-600 dark:text-slate-300">
                    Class: <strong className="text-sky-700 dark:text-[#38BDF8]">{primaryLineItem.nmfcClass || '70'}</strong>
                  </span>
                  <span>&bull;</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Units: <strong className="text-slate-900 dark:text-white">{quote.totalUnits}</strong> {primaryLineItem.type || 'PLT'}
                  </span>
                </div>
              </div>

              {/* Total Gross Weight */}
              <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1 min-w-0">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center justify-between">
                  <span>TOTAL GROSS WEIGHT</span>
                  <span className="text-[10px] text-yellow-700 dark:text-yellow-400 font-mono font-normal">Audited</span>
                </div>
                <div className="text-base sm:text-lg font-black text-yellow-600 dark:text-[#FACC15] tracking-tight">
                  {quote.totalWeightLbs.toLocaleString()} <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">lbs</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {quote.totalUnits} total shipping unit{quote.totalUnits === 1 ? '' : 's'} (total line weight)
                </div>
              </div>
            </div>

            {/* Selected Accessorials Strip */}
            {quote.payload.accessorials && quote.payload.accessorials.length > 0 ? (
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mr-1">
                  Required Accessorials:
                </span>
                {quote.payload.accessorials.map((acc) => (
                  <span key={acc} className="tag-yellow text-[11px] px-2 py-0.5 rounded-full font-semibold">
                    {acc}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* =========================================================================
          LIVE CARRIER TARIFFS SECTION (RATES FORMATTED LOWER & 100% VISIBLE)
          At ANY zoom level (70% - 200%), every card features a dedicated LOWER row
          for Direct Rates & Booking Action Buttons. They never overflow or clip off!
          ========================================================================= */}
      <section className="w-full max-w-full space-y-4">
        {/* Header & Sorting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-baseline space-x-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Live Carrier Tariffs
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ({sortedCarriers.length} Certified Direct Carriers Available)
            </span>
          </div>

          {/* Sort Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSortBy('price')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'price'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]'
              }`}
            >
              Lowest Price
            </button>
            <button
              type="button"
              onClick={() => setSortBy('transit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'transit'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]'
              }`}
            >
              Fastest Transit
            </button>
            <button
              type="button"
              onClick={() => setSortBy('performance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'performance'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]'
              }`}
            >
              Reliability
            </button>
          </div>
        </div>

        {/* Carrier Cards List */}
        <div className="space-y-4">
          {sortedCarriers.map((carrier, index) => {
            const isBestPrice = index === 0 && sortBy === 'price';

            return (
              <div
                key={carrier.id}
                className={`p-4 sm:p-5 rounded-2xl glass transition-all duration-200 w-full max-w-full overflow-hidden bg-white/95 dark:bg-[#0A0D15]/90 ${
                  isBestPrice
                    ? 'border-yellow-400/50 shadow-[0_0_24px_rgba(250,204,21,0.12)]'
                    : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
                }`}
              >
                {/* -------------------------------------------------------------
                    TOP ROW OF CARD: CARRIER IDENTITY & TRANSIT LOGISTICS
                    Clean flex layout that accommodates any screen or zoom width
                    ------------------------------------------------------------- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3.5 border-b border-slate-200 dark:border-white/[0.07]">
                  {/* Left: Carrier Logo, Name, SCAC, Service */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center p-1.5 font-black text-slate-950 text-xs text-center shadow-md shrink-0 border border-slate-200">
                      {carrier.carrierLogo ? (
                        <img
                          src={carrier.carrierLogo}
                          alt={carrier.carrierName}
                          className="w-10 h-10 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="leading-tight font-extrabold tracking-tight">
                          {carrier.carrierCode || carrier.carrierName.substring(0, 4).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                          {carrier.carrierName}
                        </span>
                        {isBestPrice && (
                          <span className="tag-yellow text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0">
                            Best Value
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-sky-700 dark:text-[#38BDF8] font-semibold truncate">
                        {carrier.serviceClass}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        SCAC: <strong className="text-slate-700 dark:text-slate-300">{carrier.carrierCode}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: Transit Time & Carrier Liability */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-left shrink-0">
                    {/* Transit Time */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                        Transit Time
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {carrier.transitDays} Business {carrier.transitDays === 1 ? 'Day' : 'Days'}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        <span>{carrier.pickupPerformance}% On-Time</span>
                      </div>
                    </div>

                    {/* Carrier Liability */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                        Carrier Liability
                      </div>
                      <div className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate max-w-[160px] sm:max-w-[200px]" title={carrier.liability}>
                        {carrier.liability}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Direct Door-to-Door
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    MIDDLE ROW OF CARD: ROUTE NOTES & SURCHARGE BADGES
                    ------------------------------------------------------------- */}
                <div className="pt-3 pb-1 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="line-clamp-2 leading-relaxed text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs">
                    {carrier.notes || "Detention and pick up attempt fee might apply. Check carrier's rules tariff for banned commodities. Direct electronic Proof of Delivery."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-sky-700 dark:text-[#38BDF8] font-mono font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-sky-600 dark:text-[#38BDF8]" />
                      Fuel Surcharge Included
                    </span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Valid 7 Days Guaranteed</span>
                    <span>&bull;</span>
                    <span className="text-slate-500 dark:text-slate-400">Direct Terminal Contract Tariff</span>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    LOWER ROW OF CARD: DEDICATED RATE & BOOKING SECTION
                    GUARANTEED LOWER & VISIBLE AT ANY ZOOM LEVEL (70% - 200%)
                    This solves the issue where rates were getting pushed off
                    to the right side and overflowing the client screen interface!
                    ------------------------------------------------------------- */}
                <div className="mt-3.5 pt-3.5 border-t border-slate-200 dark:border-white/[0.08] w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-slate-100/80 dark:bg-white/[0.03] p-3.5 sm:p-4 rounded-xl">
                  {/* Rate Display (Prominent & Clear) */}
                  <div className="flex items-baseline justify-between sm:justify-start sm:space-x-3">
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                        Direct Rate
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-[#FACC15] tracking-tight leading-none">
                          ${carrier.finalRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Buttons (Full width on mobile/zoomed, always visible) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      id={`btn-book-${carrier.carrierId}`}
                      type="button"
                      onClick={() => onBookCarrier(carrier, false)}
                      className="py-2.5 px-6 rounded-xl btn-yellow text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-yellow-400/20 cursor-pointer font-black text-center whitespace-nowrap min-h-[40px] flex items-center justify-center active:scale-98"
                    >
                      Book Direct
                    </button>

                    <button
                      id={`btn-book-insurance-${carrier.carrierId}`}
                      type="button"
                      onClick={() => onBookCarrier(carrier, true)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-white/[0.14] hover:bg-slate-200/60 dark:hover:bg-white/[0.08] bg-white/50 dark:bg-transparent text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap min-h-[40px]"
                      title="Includes declared cargo value insurance"
                    >
                      <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-[#38BDF8] shrink-0" />
                      <span>W/ Full Insurance &bull; ${carrier.finalRateWithInsurance.toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
