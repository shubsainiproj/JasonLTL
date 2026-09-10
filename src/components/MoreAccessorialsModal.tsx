import React, { useState, useMemo } from 'react';
import { X, Search, Mail, Check, AlertCircle } from 'lucide-react';
import {
  AccessorialItem,
  MORE_GENERAL_ACCESSORIALS,
  MORE_ORIGIN_ACCESSORIALS,
  MORE_DELIVERY_ACCESSORIALS,
} from '../data/accessorialsData';

interface MoreAccessorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const MoreAccessorialsModal: React.FC<MoreAccessorialsModalProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'origin' | 'delivery'>('all');

  const allItems = useMemo(() => {
    return [
      ...MORE_GENERAL_ACCESSORIALS,
      ...MORE_ORIGIN_ACCESSORIALS,
      ...MORE_DELIVERY_ACCESSORIALS,
    ];
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.includes(searchQuery);
      return matchesTab && matchesSearch;
    });
  }, [allItems, activeTab, searchQuery]);

  const emailQuotedItems = useMemo(() => {
    return allItems.filter((item) => item.requiresEmailQuote);
  }, [allItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/[0.15] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#0F1420]">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
                More Accessorials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select additional equipment, terminal, and handling requirements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search accessorials by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-yellow-400 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              All ({allItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-yellow-400 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              General ({MORE_GENERAL_ACCESSORIALS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('origin')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'origin'
                  ? 'bg-yellow-400 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              Origin / Pickup ({MORE_ORIGIN_ACCESSORIALS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-yellow-400 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              Delivery ({MORE_DELIVERY_ACCESSORIALS.length})
            </button>
          </div>
        </div>

        {/* Email Quote Notice Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 flex items-center space-x-2 text-xs text-amber-900 dark:text-amber-200">
          <Mail className="w-4 h-4 text-amber-600 dark:text-[#FACC15] shrink-0" />
          <span>
            <strong>Email Quote Notice:</strong> The following accessorials must be quoted by email:{' '}
            <span className="text-amber-950 dark:text-white font-medium">
              Bonded + Form 7512, Guns handling license, Hazmat Explosives 1.4, Tobacco handling license, Jacinto Port, Trade Show Delivery.
            </span>
          </span>
        </div>

        {/* Content / Checkbox Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-white dark:bg-transparent">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No accessorials found matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    htmlFor={`acc-${item.id}`}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-yellow-400/15 border-yellow-400/50 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        id={`acc-${item.id}`}
                        checked={isSelected}
                        onChange={() => onToggle(item.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-yellow-400 border-yellow-400 text-slate-950'
                            : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-black/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0">#{item.id}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                        {item.requiresEmailQuote && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-500/30">
                            <Mail className="w-2.5 h-2.5" /> Quoted by email
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#0F1420] flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="text-yellow-600 dark:text-[#FACC15] font-bold">{selectedIds.length}</span> accessorial{selectedIds.length === 1 ? '' : 's'} selected
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
