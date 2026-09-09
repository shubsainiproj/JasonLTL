import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  Copy,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  MapPin,
  FileText,
  Info,
  Sparkles,
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

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 2-Column Minimalist Layout (Sidebar Parameters + Carrier Options) */}
      <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 items-start">
        
        {/* Left Aside: Quote Parameters (Spacious Minimalist Glass Card) */}
        <aside className="w-full space-y-4">
          <div className="glass p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Shipment Parameters
              </span>
              <button
                id="btn-edit-parameters"
                type="button"
                onClick={onBackToQuote}
                className="text-xs font-bold text-[#FACC15] hover:text-yellow-300 transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Spec</span>
              </button>
            </div>

            {/* Content Parameters */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Origin & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-white/[0.06]">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">ORIGIN</div>
                  <div className="font-bold text-white truncate text-sm" title={quote.payload.pickupLocation}>
                    {quote.payload.pickupLocation}
                  </div>
                  <div className="font-mono text-xs text-[#38BDF8]">ZIP {quote.payload.pickupZip}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">DESTINATION</div>
                  <div className="font-bold text-white truncate text-sm" title={quote.payload.deliveryLocation}>
                    {quote.payload.deliveryLocation}
                  </div>
                  <div className="font-mono text-xs text-[#38BDF8]">ZIP {quote.payload.deliveryZip}</div>
                </div>
              </div>

              {/* Commodity */}
              <div className="space-y-0.5">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">COMMODITY DESCRIPTION</div>
                <div className="font-medium text-slate-200 text-sm truncate" title={primaryLineItem.commodity}>
                  {primaryLineItem.commodity}
                </div>
              </div>

              {/* Units, Weight, Class */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">UNITS</div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {quote.totalUnits} {primaryLineItem.type ? primaryLineItem.type.substring(0, 3).toUpperCase() : 'PLT'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">WEIGHT</div>
                  <div className="font-bold text-[#FACC15] text-sm mt-0.5">
                    {quote.totalWeightLbs.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">lbs</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">CLASS</div>
                  <div className="font-bold text-[#38BDF8] text-sm mt-0.5">
                    {primaryLineItem.nmfcClass || '70'}
                  </div>
                </div>
              </div>

              {/* Selected Accessorials Tags */}
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Transit Requirements &amp; Accessorials
                </div>
                {quote.payload.accessorials.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {quote.payload.accessorials.map((acc) => (
                      <span key={acc} className="tag-yellow text-xs">
                        {acc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Standard dock-to-dock service</span>
                )}
              </div>
            </div>

            {/* Bottom Reference & Share Link */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Quote Reference #</span>
                <span className="font-mono text-[#38BDF8] font-bold tracking-wide">{quote.quoteToken}</span>
              </div>
              <button
                id="btn-copy-token"
                type="button"
                onClick={copyShareLink}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              >
                {copiedToken ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Share Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rate Guarantee Strip */}
          <div className="glass p-4 text-xs flex items-center justify-between text-slate-300">
            <span className="font-medium">Tariff Rate Lock:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Valid 7 Days Guaranteed
            </span>
          </div>
        </aside>

        {/* Right Section: Carrier Options & Results */}
        <section className="space-y-4">
          {/* Controls Strip with Sort Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-baseline space-x-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Live Carrier Tariffs
              </h2>
              <span className="text-xs text-slate-400 font-normal">
                ({sortedCarriers.length} Carriers Available)
              </span>
            </div>

            {/* Sort Filter Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSortBy('price')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  sortBy === 'price'
                    ? 'bg-yellow-400 text-slate-950 shadow-sm'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                }`}
              >
                Lowest Price
              </button>
              <button
                type="button"
                onClick={() => setSortBy('transit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  sortBy === 'transit'
                    ? 'bg-yellow-400 text-slate-950 shadow-sm'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                }`}
              >
                Fastest Transit
              </button>
              <button
                type="button"
                onClick={() => setSortBy('performance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  sortBy === 'performance'
                    ? 'bg-yellow-400 text-slate-950 shadow-sm'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                }`}
              >
                Reliability
              </button>
            </div>
          </div>

          {/* Spacious Carrier Cards */}
          <div className="space-y-3.5">
            {sortedCarriers.map((carrier, index) => {
              const isBestPrice = index === 0 && sortBy === 'price';

              return (
                <div
                  key={carrier.id}
                  className={`p-5 sm:p-6 rounded-2xl glass transition-all duration-200 ${
                    isBestPrice
                      ? 'border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.08)]'
                      : 'border-white/[0.08] hover:border-white/[0.18]'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[76px_1.5fr_1fr_1fr_1.4fr] items-center gap-4 sm:gap-5">
                    {/* Carrier Logo Box */}
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 font-black text-slate-950 text-xs text-center shadow-md shrink-0 border border-slate-200">
                      {carrier.carrierLogo ? (
                        <img
                          src={carrier.carrierLogo}
                          alt={carrier.carrierName}
                          className="w-12 h-12 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="leading-tight font-extrabold tracking-tight">
                          {carrier.carrierCode || carrier.carrierName.substring(0, 4).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Carrier Name & Service Class */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base sm:text-lg truncate">
                          {carrier.carrierName}
                        </span>
                        {isBestPrice && (
                          <span className="tag-yellow text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                            Best Value
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#38BDF8] font-semibold">
                        {carrier.serviceClass}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        SCAC: <strong className="text-slate-300">{carrier.carrierCode}</strong>
                      </div>
                    </div>

                    {/* Transit Time & On-Time Performance */}
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">
                        Transit Time
                      </div>
                      <div className="font-bold text-sm sm:text-base text-white">
                        {carrier.transitDays} Business {carrier.transitDays === 1 ? 'Day' : 'Days'}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{carrier.pickupPerformance}% On-Time</span>
                      </div>
                    </div>

                    {/* Liability & Coverage */}
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">
                        Carrier Liability
                      </div>
                      <div className="font-medium text-xs sm:text-sm text-slate-200">
                        {carrier.liability}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Direct Door-to-Door
                      </div>
                    </div>

                    {/* Rate Box & Action Buttons */}
                    <div className="text-left md:text-right space-y-2">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">
                        Direct Rate
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-[#FACC15] tracking-tight leading-none">
                        ${carrier.finalRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          id={`btn-book-${carrier.carrierId}`}
                          type="button"
                          onClick={() => onBookCarrier(carrier, false)}
                          className="w-full py-2.5 px-4 rounded-xl btn-yellow text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer font-black"
                        >
                          Book Direct
                        </button>

                        <button
                          id={`btn-book-insurance-${carrier.carrierId}`}
                          type="button"
                          onClick={() => onBookCarrier(carrier, true)}
                          className="w-full py-1.5 px-3 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] text-slate-300 text-xs font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                          title="Includes declared cargo value insurance"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span className="truncate">W/ Full Insurance &bull; ${carrier.finalRateWithInsurance.toFixed(2)}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footnote on pickup terms */}
                  <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate">{carrier.notes || 'Direct carrier dispatch with automated Proof of Delivery'}</span>
                    <span className="text-[#38BDF8] font-mono shrink-0 ml-3 font-semibold">Fuel Surcharge Included</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
