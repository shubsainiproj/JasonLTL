import React from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { EXCLUDED_COMMODITIES } from '../data/accessorialsData';

interface ExcludedCommoditiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcludedCommoditiesModal: React.FC<ExcludedCommoditiesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#0B0F17] border border-white/[0.15] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-white/[0.1] bg-[#0F1420]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Excluded Commodities Tariff Policy
              </h3>
              <p className="text-xs text-slate-400">
                Items prohibited from standard LTL carrier dispatch without dedicated waivers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              The following commodities cannot be rated or transported via standard LTL consolidation tariffs.
              Shipments containing these materials require specialized FTL permits or pre-arranged insurance riders.
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {EXCLUDED_COMMODITIES.map((comm, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.15] transition-all"
              >
                <div className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{comm.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-3.5 mt-1 leading-relaxed">
                  {comm.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-white/[0.1] bg-[#0F1420] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
