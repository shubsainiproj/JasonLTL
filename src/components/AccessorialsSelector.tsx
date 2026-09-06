import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Search, Shield, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

interface AccessorialsSelectorProps {
  selectedAccessorials: string[];
  onChange: (accessorials: string[]) => void;
  commonList: string[];
  generalList: string[];
  originList: string[];
  deliveryList: string[];
}

const DEFAULT_COMMON = [
  'Liftgate Pickup',
  'Liftgate Delivery',
  'Inside Pick Up',
  'Inside Delivery',
  'Limited access Pick Up',
  'Limited Access Delivery',
  'Pickup Appointment',
  'Delivery Appointment',
  'Protect From Freezing',
  'Residential Delivery',
];

const DEFAULT_GENERAL = [
  'Air Ride truck',
  'Bonded',
  'Double Blind',
  'Guaranteed transit time',
  'Hazmat 2.3',
  'Household Goods',
  'Pallets-Crates-Skids',
  'Dock Height',
  'Straps',
  'Reefer',
  'Hazardous Material Handling',
];

const DEFAULT_ORIGIN = [
  'Airport Pick Up',
  'Blind Pick Up',
  'Distribution Center Pickup',
  'Inside Pick Up',
  'Limited access Pick Up',
  'Port Pick Up',
  'Pickup Appointment',
];

const DEFAULT_DELIVERY = [
  'Airport Delivery',
  'Amazon Warehouse Delivery',
  'Blind Delivery',
  'Costco Delivery',
  'Curbside Delivery',
  'Delivery Appointment',
  'Inside Delivery',
  'Liftgate Delivery',
  'Limited Access Delivery',
  'Residential Delivery',
];

export const AccessorialsSelector: React.FC<AccessorialsSelectorProps> = ({
  selectedAccessorials,
  onChange,
  commonList = [],
  generalList = [],
  originList = [],
  deliveryList = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'origin' | 'delivery'>('all');

  const activeCommon = commonList.length > 0 ? commonList : DEFAULT_COMMON;
  const activeGeneral = generalList.length > 0 ? generalList : DEFAULT_GENERAL;
  const activeOrigin = originList.length > 0 ? originList : DEFAULT_ORIGIN;
  const activeDelivery = deliveryList.length > 0 ? deliveryList : DEFAULT_DELIVERY;

  const toggleItem = (item: string) => {
    if (selectedAccessorials.includes(item)) {
      onChange(selectedAccessorials.filter((a) => a !== item));
    } else {
      onChange([...selectedAccessorials, item]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const filterItems = (list: string[]) => {
    if (!searchQuery.trim()) return list;
    return list.filter((i) => i.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  };

  const filteredGeneral = filterItems(activeGeneral);
  const filteredOrigin = filterItems(activeOrigin);
  const filteredDelivery = filterItems(activeDelivery);

  return (
    <div className="w-full space-y-3">
      {/* Header & Quick Common Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            COMMON ACCESSORIALS
          </label>
          {selectedAccessorials.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <span className="badge-hd text-[#38BDF8]">
                {selectedAccessorials.length} Selected
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] text-slate-500 hover:text-red-400 underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 text-xs font-semibold text-[#38BDF8] hover:text-sky-300 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Catalog' : '+ More Accessorials (Full Catalog)'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Common Accessorials Direct Click Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {activeCommon.map((item) => {
          const isSelected = selectedAccessorials.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleItem(item)}
              className={`flex items-start space-x-2 p-2 rounded-md border text-left text-xs cursor-pointer select-none transition-all ${
                isSelected
                  ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-white shadow-sm ring-1 ring-[#38BDF8]/30'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:border-white/[0.15] hover:bg-white/[0.05]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-950 font-bold'
                    : 'border-slate-500 bg-[#0A0C10]'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span className={`text-[11px] leading-tight ${isSelected ? 'font-semibold text-sky-200' : 'font-medium'}`}>
                {item}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Section for Complete Catalog */}
      {isExpanded && (
        <div className="glass p-4 rounded-xl border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-white/[0.06] pb-3">
            <div className="flex items-center space-x-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`tag cursor-pointer ${activeTab === 'all' ? 'tag-active font-semibold' : ''}`}
              >
                All Accessorials
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`tag cursor-pointer ${activeTab === 'general' ? 'tag-active font-semibold' : ''}`}
              >
                General ({activeGeneral.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('origin')}
                className={`tag cursor-pointer ${activeTab === 'origin' ? 'tag-active font-semibold' : ''}`}
              >
                Origin ({activeOrigin.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className={`tag cursor-pointer ${activeTab === 'delivery' ? 'tag-active font-semibold' : ''}`}
              >
                Delivery ({activeDelivery.length})
              </button>
            </div>

            {/* Quick Filter */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter accessorials..."
                className="glass-input w-full pl-8 pr-2.5 py-1 rounded-md text-xs placeholder-slate-500"
              />
            </div>
          </div>

          {/* Categorized Sections */}
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {/* General Section */}
            {(activeTab === 'all' || activeTab === 'general') && filteredGeneral.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-[#38BDF8]" />
                  <span>General Accessorials ({filteredGeneral.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {filteredGeneral.map((item) => {
                    const isSelected = selectedAccessorials.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border text-[11px] text-left cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-sky-200 font-semibold ring-1 ring-[#38BDF8]/30'
                            : 'bg-white/[0.02] border-white/[0.05] text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded flex items-center justify-center border shrink-0 ${
                            isSelected ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-950 font-bold' : 'border-slate-600 bg-[#0A0C10]'
                          }`}
                        >
                          {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Origin Section */}
            {(activeTab === 'all' || activeTab === 'origin') && filteredOrigin.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3 text-[#38BDF8]" />
                  <span>Origin Accessorials ({filteredOrigin.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {filteredOrigin.map((item) => {
                    const isSelected = selectedAccessorials.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border text-[11px] text-left cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-sky-200 font-semibold ring-1 ring-[#38BDF8]/30'
                            : 'bg-white/[0.02] border-white/[0.05] text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded flex items-center justify-center border shrink-0 ${
                            isSelected ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-950 font-bold' : 'border-slate-600 bg-[#0A0C10]'
                          }`}
                        >
                          {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery Section */}
            {(activeTab === 'all' || activeTab === 'delivery') && filteredDelivery.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ArrowDownRight className="w-3 h-3 text-[#38BDF8]" />
                  <span>Delivery Accessorials ({filteredDelivery.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {filteredDelivery.map((item) => {
                    const isSelected = selectedAccessorials.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border text-[11px] text-left cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-sky-200 font-semibold ring-1 ring-[#38BDF8]/30'
                            : 'bg-white/[0.02] border-white/[0.05] text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded flex items-center justify-center border shrink-0 ${
                            isSelected ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-950 font-bold' : 'border-slate-600 bg-[#0A0C10]'
                          }`}
                        >
                          {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
