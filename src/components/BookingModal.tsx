import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  X,
  Printer,
  Truck,
  Calendar,
  MapPin,
  Loader2,
  Mail,
  Phone,
  Building,
  FileText,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
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
  const [emailNotice, setEmailNotice] = useState('');
  const [error, setError] = useState('');

  // Form inputs
  const [bookerEmail, setBookerEmail] = useState('');

  // Pickup Location Details
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupContactEmail, setPickupContactEmail] = useState('');

  // Delivery Location Details
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryContactEmail, setDeliveryContactEmail] = useState('');

  // Special Instructions
  const [specialInstructions, setSpecialInstructions] = useState('');

  const finalPrice = withInsurance ? carrier.finalRateWithInsurance : carrier.finalRate;
  const isOriginCanada = quote.payload.pickupCountry === 'CA';
  const isDestCanada = quote.payload.deliveryCountry === 'CA';

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const cleanBookerEmail = bookerEmail.trim();
    if (!cleanBookerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanBookerEmail)) {
      setError('Please enter a valid Booker / User Email address.');
      return;
    }

    if (!pickupAddress.trim()) {
      setError('Please enter the Origin / Pickup physical street address.');
      return;
    }

    if (!pickupPhone.trim()) {
      setError('Please enter an Origin / Pickup contact phone number.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter the Destination / Delivery physical street address.');
      return;
    }

    if (!deliveryPhone.trim()) {
      setError('Please enter a Destination / Delivery contact phone number.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/quote/${quote.quoteToken}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierId: carrier.carrierId,
          withInsurance,
          bookerEmail: cleanBookerEmail,
          pickupDetails: {
            address: pickupAddress.trim(),
            phone: pickupPhone.trim(),
            email: pickupContactEmail.trim() || cleanBookerEmail,
          },
          deliveryDetails: {
            address: deliveryAddress.trim(),
            phone: deliveryPhone.trim(),
            email: deliveryContactEmail.trim() || cleanBookerEmail,
          },
          specialInstructions: specialInstructions.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete shipment booking.');
      }

      setBookingRef(data.bookingReference);
      setEmailNotice(data.emailNotice || `Dispatch confirmation emailed to Jason@cylltd.com with ${cleanBookerEmail} in CC.`);
      setBookingConfirmed(true);
      onConfirmSuccess();
    } catch (err: any) {
      setError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05070A]/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col glass rounded-2xl border border-white/[0.12] shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0c101c]/80">
          <div className="flex items-center space-x-2.5 text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4 text-[#FACC15]" />
            <span>Direct Carrier Dispatch Booking</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {!bookingConfirmed ? (
            <form onSubmit={handleConfirm} className="space-y-6">
              
              {/* Carrier & Rate Summary Card */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-3">
                    {carrier.carrierLogo ? (
                      <img
                        src={carrier.carrierLogo}
                        alt={carrier.carrierName}
                        referrerPolicy="no-referrer"
                        className="h-7 w-auto max-w-[100px] object-contain rounded bg-white/5 p-1 border border-white/10"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                        {carrier.carrierName}
                      </h3>
                      <div className="text-xs text-slate-400">
                        {carrier.serviceClass} &bull; SCAC: <span className="font-mono text-slate-200">{carrier.carrierCode || 'DIRECT'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-[#FACC15] tracking-tight">
                      ${finalPrice.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#38BDF8]">
                      {withInsurance ? '✓ With Full Cargo Insurance' : 'Standard Carrier Liability'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Origin Route</span>
                    <span className="font-semibold text-slate-200">
                      {isOriginCanada ? 'CA' : 'US'} {quote.payload.pickupZip}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Destination Route</span>
                    <span className="font-semibold text-slate-200">
                      {isDestCanada ? 'CA' : 'US'} {quote.payload.deliveryZip}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Est. Transit</span>
                    <span className="font-semibold text-slate-200">
                      {carrier.transitDays} Days ({carrier.estDeliveryDate})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cargo Units</span>
                    <span className="font-semibold text-slate-200">
                      {quote.totalUnits} Units &bull; {quote.totalWeightLbs.toLocaleString()} lbs
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Booker / User Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Booker / User Email</span>
                    <span className="text-amber-400 font-black">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-400 lowercase">
                    (Dispatched to Jason@cylltd.com with user kept in CC)
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={bookerEmail}
                  onChange={(e) => setBookerEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.12] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all font-medium"
                />
              </div>

              {/* 2. Pickup Location Details */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                    <MapPin className="w-4 h-4 text-[#38BDF8]" />
                    <span>Pickup Location Details</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {isOriginCanada ? 'Postal' : 'ZIP'}: {quote.payload.pickupZip} ({quote.payload.pickupLocation})
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="123 Industrial Parkway, Suite A / Dock 2"
                      className="w-full px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Phone Number <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={pickupPhone}
                        onChange={(e) => setPickupPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={pickupContactEmail}
                        onChange={(e) => setPickupContactEmail(e.target.value)}
                        placeholder="shipping@origin.com (optional)"
                        className="w-full px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Delivery Location Details */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Delivery Location Details</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {isDestCanada ? 'Postal' : 'ZIP'}: {quote.payload.deliveryZip} ({quote.payload.deliveryLocation})
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="789 Commerce Way, Receiving Bay 4"
                      className="w-full px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Phone Number <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={deliveryContactEmail}
                        onChange={(e) => setDeliveryContactEmail(e.target.value)}
                        placeholder="receiving@destination.com (optional)"
                        className="w-full px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Special Instructions (Optional) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Special Pickup / Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Call 1 hour prior to arrival, liftgate required at delivery dock, receiving hours 8am-3pm"
                  className="w-full px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15] resize-none"
                />
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
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
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3 rounded-xl btn-yellow disabled:opacity-50 text-xs sm:text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider font-extrabold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Sending Dispatch Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>SUBMIT &amp; DISPATCH EMAIL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Booking Success View with Email Dispatch Confirmation */
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-150">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">
                  Shipment Booked &amp; Dispatched!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Order tendered to <strong className="text-white">{carrier.carrierName}</strong>.
                </p>
              </div>

              {/* Email Sent Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 text-left flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-300">Dispatch Email Dispatched Successfully</div>
                  <div className="text-[11px] text-emerald-400/90 mt-0.5">
                    Sent to <strong>Jason@cylltd.com</strong> with <strong>{bookerEmail}</strong> in CC.
                  </div>
                </div>
              </div>

              {/* Reference details */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-left text-xs sm:text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Bill of Lading (BOL):</span>
                  <span className="font-mono font-bold text-[#FACC15] text-sm">{bookingRef}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Tariff Quote Token:</span>
                  <span className="font-mono text-xs text-slate-300">{quote.quoteToken}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Origin Street:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[280px]">{pickupAddress}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Delivery Street:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[280px]">{deliveryAddress}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Carrier SCAC:</span>
                  <span className="font-semibold text-white font-mono">{carrier.carrierCode || 'DIRECT'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Charged Rate:</span>
                  <span className="font-bold text-[#FACC15]">${finalPrice.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-1/2 py-3 rounded-xl border border-white/[0.1] hover:bg-white/[0.06] text-xs sm:text-sm font-semibold text-slate-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#38BDF8]" />
                  <span>Print Paperwork</span>
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
    </div>
  );
};
