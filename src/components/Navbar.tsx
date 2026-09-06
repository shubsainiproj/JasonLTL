import React from 'react';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { SystemStatus } from '../types';

interface NavbarProps {
  status: SystemStatus | null;
  onRefreshStatus: () => void;
  onOpenRenderGuide: () => void;
  onNewQuote: () => void;
  onLogin?: () => void;
  isLoggingIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  onRefreshStatus,
  onNewQuote,
  onLogin,
  isLoggingIn,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full h-18 border-b border-white/[0.08] bg-[#05070A]/90 backdrop-blur-xl px-4 sm:px-8">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3.5 cursor-pointer select-none" onClick={onNewQuote}>
          <div className="w-9 h-9 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-[#FACC15] shrink-0 shadow-[0_0_12px_rgba(250,204,21,0.2)]">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="font-black text-xl sm:text-2xl tracking-tight text-white uppercase">
              JASON<span className="text-[#FACC15]">LTL</span>
            </span>
            <span className="tag-yellow text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
              Direct Execution
            </span>
          </div>
        </div>

        {/* Center / Authenticated State */}
        <div className="hidden md:flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-3 text-slate-300 bg-white/[0.03] border border-white/[0.09] px-3.5 py-1.5 rounded-xl">
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
              <span className="text-slate-400 font-mono">({status?.emailMasked || 'Jason@cylltd.com'})</span>
            </div>
            {onLogin && (
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="ml-2 px-2.5 py-0.5 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/30 text-[#FACC15] text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1"
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
              className="p-1 text-slate-400 hover:text-[#FACC15] transition-colors"
              title="Refresh session state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {onLogin && (
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="md:hidden px-3 py-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-[#FACC15] text-xs font-bold cursor-pointer"
            >
              {isLoggingIn ? 'Syncing...' : status?.sessionActive ? 'Connected' : 'Connect'}
            </button>
          )}

          {/* New Quote Button */}
          <button
            id="btn-new-quote"
            type="button"
            onClick={onNewQuote}
            className="px-4 py-2 rounded-xl btn-yellow text-xs sm:text-sm font-extrabold uppercase tracking-wide cursor-pointer shadow-md"
          >
            + New Quote
          </button>
        </div>
      </div>
    </header>
  );
};
