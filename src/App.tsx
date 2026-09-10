import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { QuoteForm } from './components/QuoteForm';
import { CarrierResults } from './components/CarrierResults';
import { BookingModal } from './components/BookingModal';
import { LegalAndRulesModal, LegalTab } from './components/LegalAndRulesModal';
import { CarrierQuote, QuoteRequestPayload, QuoteResult, SystemStatus } from './types';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Truck,
  Anchor,
  Thermometer,
  Flame,
  Plane,
  PackageCheck,
  Check,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSelection, setBookingSelection] = useState<{ carrier: CarrierQuote; withInsurance: boolean } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authBanner, setAuthBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);

  // Accessorial lists loaded from server
  const [commonAccessorials, setCommonAccessorials] = useState<string[]>([]);
  const [generalAccessorials, setGeneralAccessorials] = useState<string[]>([]);
  const [originAccessorials, setOriginAccessorials] = useState<string[]>([]);
  const [deliveryAccessorials, setDeliveryAccessorials] = useState<string[]>([]);
  const [nmfcClasses, setNmfcClasses] = useState<string[]>([]);
  const [packageTypes, setPackageTypes] = useState<string[]>([]);

  // 1. Fetch initial status and accessorials
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // offline or startup
    }
  }, []);

  const fetchAccessorials = useCallback(async () => {
    try {
      const res = await fetch('/api/accessorials');
      if (res.ok) {
        const data = await res.json();
        setCommonAccessorials(data.common || []);
        setGeneralAccessorials(data.general || []);
        setOriginAccessorials(data.origin || []);
        setDeliveryAccessorials(data.delivery || []);
        setNmfcClasses(data.nmfcClasses || []);
        setPackageTypes(data.packageTypes || []);
      }
    } catch {
      // fallback
    }
  }, []);

  // 2. Token-based URL handling (e.g. #quote=JLT-XXXX or ?token=JLT-XXXX)
  const checkTokenInUrl = useCallback(async () => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');

    if (!token && hash.includes('quote=')) {
      token = hash.split('quote=')[1]?.split('&')[0];
    }

    if (token) {
      const cleanToken = token.trim();
      if (!/^[A-Za-z0-9_-]{4,64}$/.test(cleanToken)) {
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/quote/${encodeURIComponent(cleanToken)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setQuoteResult(json.data);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchAccessorials();
    checkTokenInUrl();

    // Listen to hash change
    window.addEventListener('hashchange', checkTokenInUrl);
    return () => window.removeEventListener('hashchange', checkTokenInUrl);
  }, [fetchStatus, fetchAccessorials, checkTokenInUrl]);

  // 3. Quote Submission Handler
  const handleQuoteSubmit = async (payload: QuoteRequestPayload) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    // Allow up to 140s on client to comfortably accommodate 120s deep rating engine
    const timeoutId = setTimeout(() => controller.abort(), 140000);

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok || !data.success) {
        const rawErr = data.error || 'Freight quote request failed. Please check shipment parameters.';
        const cleanErr = rawErr
          .replace(/GLT/gi, 'Direct')
          .replace(/goglt\.com/gi, 'jasonltl.com')
          .replace(/myportal/gi, 'portal');
        throw new Error(cleanErr);
      }

      setQuoteResult(data.data);
      // Update browser URL to token pattern
      window.location.hash = `quote=${data.data.quoteToken}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      clearTimeout(timeoutId);
      let cleanErr = err.message || 'Error occurred while contacting freight rating engine.';
      if (err.name === 'AbortError') {
        cleanErr = 'Live carrier rating scan reached the 120-second timeout limit. Please check your origin and destination zip codes and try again.';
      } else {
        cleanErr = cleanErr
          .replace(/GLT/gi, 'Direct')
          .replace(/goglt\.com/gi, 'jasonltl.com');
      }
      setError(cleanErr);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleBackToQuote = () => {
    setQuoteResult(null);
    window.location.hash = '';
  };

  const handleBookCarrier = (carrier: CarrierQuote, withInsurance: boolean) => {
    setBookingSelection({ carrier, withInsurance });
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthBanner(null);
    try {
      const res = await fetch('/api/login', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        const cleanMsg = (data.message || 'Freight network connection verified and active.')
          .replace(/GLT/gi, 'Direct')
          .replace(/goglt\.com/gi, 'jasonltl.com');
        setAuthBanner({
          type: 'success',
          text: cleanMsg,
        });
        await fetchStatus();
      } else {
        const cleanMsg = (data.message || 'Authentication failed. Please verify credentials.')
          .replace(/GLT/gi, 'Direct')
          .replace(/goglt\.com/gi, 'jasonltl.com');
        setAuthBanner({
          type: 'error',
          text: cleanMsg,
        });
      }
    } catch (err: any) {
      const cleanErr = (err.message || 'Connection error')
        .replace(/GLT/gi, 'Direct')
        .replace(/goglt\.com/gi, 'jasonltl.com');
      setAuthBanner({
        type: 'error',
        text: `Connection notice: ${cleanErr}`,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-bright)] flex flex-col font-['Inter',sans-serif] selection:bg-[#FACC15] selection:text-black transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        status={status}
        onRefreshStatus={fetchStatus}
        onOpenRenderGuide={() => {}}
        onNewQuote={handleBackToQuote}
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
      />

      {/* Main Content Area: Responsive at all zoom levels (70% - 200%) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 py-6 sm:py-10 space-y-8 overflow-x-hidden">
        {/* Auth status banner if triggered */}
        {authBanner && (
          <div
            className={`max-w-4xl mx-auto p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all shadow-md ${
              authBanner.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {authBanner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{authBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setAuthBanner(null)}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 cursor-pointer font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Minimalist Spacious Hero Branding */}
        {!quoteResult && (
          <div className="max-w-4xl mx-auto text-center space-y-3 pt-2 pb-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-800 dark:text-[#FACC15] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct North American Logistics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Instant LTL Freight Quoting &amp; Dispatch
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Direct terminal tariffs across 30+ top North American freight carriers. <span className="text-sky-700 dark:text-[#38BDF8] font-semibold">Guaranteed door-to-door pricing</span> with zero double brokering.
            </p>
          </div>
        )}

        {/* Dynamic View: Quote Form OR Carrier Selection Page */}
        {quoteResult ? (
          <CarrierResults
            quote={quoteResult}
            onBackToQuote={handleBackToQuote}
            onBookCarrier={handleBookCarrier}
          />
        ) : (
          <>
            <QuoteForm
              onSubmitQuote={handleQuoteSubmit}
              loading={loading}
              commonAccessorials={commonAccessorials}
              generalAccessorials={generalAccessorials}
              originAccessorials={originAccessorials}
              deliveryAccessorials={deliveryAccessorials}
              nmfcClasses={nmfcClasses}
              packageTypes={packageTypes}
              error={error}
            />

            {/* THE JASON LTL COMMITMENT: Sophisticated Minimalism & Glassism */}
            <section className="w-full max-w-5xl mx-auto pt-10 space-y-6">
              <div className="glass p-7 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/[0.08] space-y-7 shadow-xl relative overflow-hidden bg-white/90 dark:bg-[#0B0F17]/90">
                
                {/* Header with Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
                  <div className="space-y-1">
                    <span className="text-xs font-black tracking-widest text-yellow-700 dark:text-[#FACC15] uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                      THE JASON LTL COMMITMENT
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      End-to-End Transportation Solutions Across the US &amp; Canada
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 px-3.5 py-1.5 rounded-full w-fit">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Direct Execution</span>
                  </div>
                </div>

                {/* Core Ethos Quote Card */}
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#080B12]/80 border-l-4 border-yellow-500 border-t border-r border-b border-slate-200 dark:border-white/[0.06] text-slate-800 dark:text-slate-100 text-sm sm:text-base italic leading-relaxed shadow-sm">
                  &ldquo;Freight is easy when everything goes right. The real value comes when challenges arise. That&rsquo;s where we deliver. No double brokering. No ghost carriers. No excuses. Just reliable freight execution and consistent communication. If it moves, we can move it.&rdquo;
                </div>

                {/* 6 Capabilities Glass Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {/* 1. Container Drayage */}
                  <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-yellow-400/60 dark:hover:border-yellow-400/30 transition-all duration-200 space-y-2 group">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-700 dark:text-[#FACC15]">
                      <Anchor className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-[#FACC15] transition-colors">
                      Container Drayage
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Direct ocean port &amp; rail ramp recovery with fast chassis turnaround across all major hubs.
                    </p>
                  </div>

                  {/* 2. OTR Freight */}
                  <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-sky-400/60 dark:hover:border-yellow-400/30 transition-all duration-200 space-y-2 group">
                    <div className="w-10 h-10 rounded-lg bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-sky-700 dark:text-[#38BDF8]">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-[#38BDF8] transition-colors">
                      OTR Freight
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      FTL, PTL, LTL, and hotshot expedited coverage nationwide with real-time tracking milestones.
                    </p>
                  </div>

                  {/* 3. HazMat Certified */}
                  <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-amber-400/60 dark:hover:border-yellow-400/30 transition-all duration-200 space-y-2 group">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                      HazMat Certified
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Full hazardous materials safety compliance, placards, and certified specialized drivers.
                    </p>
                  </div>

                  {/* 4. Temperature-Controlled */}
                  <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-cyan-400/60 dark:hover:border-yellow-400/30 transition-all duration-200 space-y-2 group">
                    <div className="w-10 h-10 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-700 dark:text-[#00F0FF]">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-[#00F0FF] transition-colors">
                      Temperature-Controlled
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Reefer transport for perishable, ambient, pharmaceutical, and climate-sensitive merchandise.
                    </p>
                  </div>

                  {/* 5. Airport Pickups */}
                  <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-sky-400/60 dark:hover:border-yellow-400/30 transition-all duration-200 space-y-2 group">
                    <div className="w-10 h-10 rounded-lg bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-sky-700 dark:text-[#38BDF8]">
                      <Plane className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-[#38BDF8] transition-colors">
                      Airport Pickups
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Expedited tarmac-to-dock recovery for urgent domestic and international air cargo dispatches.
                    </p>
                  </div>

                  {/* 6. Major Freight Networks */}
                  <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-yellow-400/60 dark:hover:border-yellow-400/30 transition-all duration-200 space-y-2 group">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-700 dark:text-[#FACC15]">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-[#FACC15] transition-colors">
                      Major Freight Networks
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Seamless compliant dispatch for Amazon, Uber Freight, FedEx, DHL, and premier national LTL networks.
                    </p>
                  </div>
                </div>

                {/* Bottom Trust Pillars */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-600 dark:text-[#FACC15]" /> No Double Brokering
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-600 dark:text-[#FACC15]" /> No Ghost Carriers
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-600 dark:text-[#FACC15]" /> Consistent Milestone Updates
                  </span>
                  <span className="flex items-center gap-2 text-sky-700 dark:text-[#38BDF8] font-bold">
                    If it moves, we can move it.
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Clean JASON LTL Minimalist Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-white/[0.08] py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50/80 dark:bg-[#05070A]/95 mt-auto transition-colors">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
          <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
            JASON<span className="text-yellow-600 dark:text-[#FACC15]">LTL</span> FREIGHT EXCHANGE
          </span>
          <span>&bull;</span>
          <span className="text-slate-700 dark:text-slate-300">United States &amp; Canada Transportation Solutions</span>
          <span>&bull;</span>
          <span className="text-sky-700 dark:text-[#38BDF8] font-semibold">Direct Carrier Execution</span>
        </div>

        {/* Legal & Operating Policies Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1">
          <button
            type="button"
            onClick={() => setLegalModalTab('rules')}
            className="text-slate-400 hover:text-[#FACC15] underline-offset-4 hover:underline cursor-pointer transition-colors"
          >
            Rules &amp; Regulations
          </button>
          <span className="text-slate-600">&bull;</span>
          <button
            type="button"
            onClick={() => setLegalModalTab('privacy')}
            className="text-slate-400 hover:text-[#38BDF8] underline-offset-4 hover:underline cursor-pointer transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-slate-600">&bull;</span>
          <button
            type="button"
            onClick={() => setLegalModalTab('terms')}
            className="text-slate-400 hover:text-emerald-400 underline-offset-4 hover:underline cursor-pointer transition-colors"
          >
            Terms of Carriage &amp; Tariffs
          </button>
        </div>

        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          No double brokering &bull; No ghost carriers &bull; Consistent communication &bull; Guaranteed door-to-door tariffs
        </p>
      </footer>

      {/* Legal, Privacy & Operating Rules Modal */}
      <LegalAndRulesModal
        isOpen={legalModalTab !== null}
        initialTab={legalModalTab || 'rules'}
        onClose={() => setLegalModalTab(null)}
      />

      {/* Booking Confirmation Modal */}
      {bookingSelection && quoteResult && (
        <BookingModal
          quote={quoteResult}
          carrier={bookingSelection.carrier}
          withInsurance={bookingSelection.withInsurance}
          onClose={() => setBookingSelection(null)}
          onConfirmSuccess={() => {}}
        />
      )}
    </div>
  );
}
