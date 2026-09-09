import React from 'react';
import { Truck, RefreshCw, ShieldCheck, BookOpen, Lock } from 'lucide-react';
import { SystemStatus } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { LegalTab } from './LegalAndRulesModal';

interface NavbarProps {
  status: SystemStatus | null;
  onRefreshStatus: () => void;
  onOpenRenderGuide?: () => void;
  onNewQuote: () => void;
  onLogin?: () => void;
  isLoggingIn?: boolean;
  onOpenLegal?: (tab: LegalTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  onRefreshStatus,
  onNewQuote,
  onLogin,
  isLoggingIn,
  onOpenLegal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#05070A]/90 backdrop-blur-xl px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer select-none py-1"
          onClick={onNewQuote}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-[#FACC15] shrink-0 shadow-[0_0_12px_rgba(250,204,21,0.2)]">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-lg sm:text-2xl tracking-tight text-white uppercase">
              JASON<span className="text-[#FACC15]">LTL</span>
            </span>
            <span className="tag-yellow text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full hidden xs:inline-flex">
              Direct Execution
            </span>
          </div>
        </div>

        {/* Center Navigation Links (Rules, Privacy, Status) */}
        <div className="hidden lg:flex items-center space-x-3 text-xs">
          {onOpenLegal && (
            <div className="flex items-center space-x-1 mr-2 text-slate-400">
              <button
                type="button"
                onClick={() => onOpenLegal('rules')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                <span>Rules &amp; Regulations</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Privacy Policy</span>
              </button>
            </div>
          )}

          {/* Connection Status Badge */}
          <div className="flex items-center space-x-2.5 text-slate-300 bg-white/[0.03] border border-white/[0.09] px-3 py-1.5 rounded-xl">
            <div className="relative flex h-2 w-2">
              {status?.sessionActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              )}
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-white font-semibold">{status?.accountName || 'Jason Harris'}</span>
              <span className="text-slate-400 font-mono text-[11px]">({status?.emailMasked || 'Jason@cylltd.com'})</span>
            </div>
            {onLogin && (
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="ml-1.5 px-2 py-0.5 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/30 text-[#FACC15] text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1"
                title="Verify carrier dispatch connection"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <span>{status?.sessionActive ? 'Re-sync' : 'Connect'}</span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onRefreshStatus}
              className="p-1 text-slate-400 hover:text-[#FACC15] transition-colors cursor-pointer"
              title="Refresh session state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Controls: Theme Switcher & New Quote */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Auto / Light / Dark Theme Switcher */}
          <ThemeToggle />

          {/* New Quote Button */}
          <button
            id="btn-new-quote"
            type="button"
            onClick={onNewQuote}
            className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl btn-yellow text-xs sm:text-sm font-extrabold uppercase tracking-wide cursor-pointer shadow-md min-h-[38px] flex items-center justify-center whitespace-nowrap"
          >
            + New Quote
          </button>
        </div>
      </div>

      {/* Mobile Secondary Bar for Rules & Privacy */}
      {onOpenLegal && (
        <div className="flex lg:hidden items-center justify-center space-x-4 pt-2 border-t border-white/[0.05] mt-2 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => onOpenLegal('rules')}
            className="flex items-center space-x-1 hover:text-white py-1 px-2 cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-yellow-400" />
            <span>Rules &amp; Regulations</span>
          </button>
          <span className="text-slate-600">&bull;</span>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="flex items-center space-x-1 hover:text-white py-1 px-2 cursor-pointer"
          >
            <Lock className="w-3 h-3 text-sky-400" />
            <span>Privacy Policy</span>
          </button>
        </div>
      )}
    </header>
  );
};
