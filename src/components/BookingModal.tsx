import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, X, FileText, Printer, Truck, Calendar, MapPin, Loader2 } from 'lucide-react';
import { CarrierQuote, QuoteResult } from '../types';

interface BookingModalProps {
  quote: QuoteResult;
  carrier: CarrierQuote;
  withInsurance: boolean;
  onClose: () => void;
  onConfirmSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  quote,
  carrier,
  withInsurance,
  onClose,
  onConfirmSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [error, setError] = useState('');

  const finalPrice = withInsurance ? carrier.finalRateWithInsurance : carrier.finalRate;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/quote/${quote.quoteToken}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierId: carrier.carrierId,
          withInsurance,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete shipment booking.');
      }

      setBookingRef(data.bookingReference);
      setBookingConfirmed(true);
      onConfirmSuccess();
    } catch (err: any) {
      setError(err.message || 'Booking submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070A]/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass p-6 sm:p-7 rounded-2xl border border-white/[0.1] shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!bookingConfirmed ? (
          <>
            {/* Modal Header */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Confirm Direct Carrier Dispatch</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {carrier.carrierName}
              </h3>
              <p className="text-xs text-slate-400">
                Tariff Reference Token: <span className="font-mono text-[#FACC15] font-semibold">{quote.quoteToken}</span>
              </p>
            </div>

            {/* Shipment Summary Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Carrier Service Tier:</span>
                <span className="font-bold text-white">{carrier.serviceClass}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Estimated Transit:</span>
                <span className="font-semibold text-white">{carrier.transitDays} Days ({carrier.estDeliveryDate})</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Origin / Destination:</span>
                <span className="font-medium text-slate-200 truncate max-w-[220px]">
                  ZIP {quote.payload.pickupZip} &rarr; ZIP {quote.payload.deliveryZip}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Handling Units &amp; Weight:</span>
                <span className="font-medium text-slate-200">
                  {quote.totalUnits} Units &bull; {quote.totalWeightLbs.toLocaleString()} lbs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cargo Coverage:</span>
                <span className={`font-semibold ${withInsurance ? 'text-[#38BDF8] flex items-center gap-1.5' : 'text-slate-400'}`}>
                  {withInsurance ? <><ShieldCheck className="w-4 h-4 text-[#38BDF8]" /> Full Declared Value</> : 'Carrier Standard ($25/lb)'}
                </span>
              </div>
            </div>

            {/* Price Total Card */}
            <div className="p-4 rounded-xl glass-yellow border border-yellow-400/30 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-slate-400">Guaranteed Door-to-Door Rate</div>
                <div className="text-xs text-slate-400 mt-0.5">Terminal pickup &amp; fuel included</div>
              </div>
              <div className="text-3xl font-black text-[#FACC15] tracking-tight">
                ${finalPrice.toFixed(2)}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl border border-white/[0.1] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-2/3 py-3 rounded-xl btn-yellow disabled:opacity-50 text-xs sm:text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider font-extrabold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <span>CONFIRM &amp; DISPATCH</span>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Booking Success View */
          <div className="text-center py-4 space-y-4 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                Shipment Booked Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Dispatch confirmed with <strong className="text-white">{carrier.carrierName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-left text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bill of Lading (BOL):</span>
                <span className="font-mono font-bold text-[#FACC15] text-sm">{bookingRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Carrier SCAC:</span>
                <span className="font-semibold text-white font-mono">{carrier.carrierCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Scheduled Pickup Date:</span>
                <span className="font-medium text-slate-200">{quote.payload.pickupDate || 'Next Business Day'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Amount Charged:</span>
                <span className="font-bold text-[#FACC15]">${finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-1/2 py-3 rounded-xl border border-white/[0.1] hover:bg-white/[0.06] text-xs sm:text-sm font-semibold text-slate-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#38BDF8]" />
                <span>Print BOL</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-3 rounded-xl btn-yellow text-xs sm:text-sm transition-all cursor-pointer font-extrabold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
