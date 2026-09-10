import React, { useState } from 'react';
import { Plus, Trash2, Layers, Calculator, Sparkles, AlertCircle, Info } from 'lucide-react';
import { LineItem } from '../types';
import { calculateDensityPcf, getNMFCClassFromDensity } from '../utils/densityCalculator';
import { ExcludedCommoditiesModal } from './ExcludedCommoditiesModal';

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  nmfcClasses: string[];
  packageTypes: string[];
}

export const LineItemsEditor: React.FC<LineItemsEditorProps> = ({
  items,
  onChange,
  nmfcClasses,
  packageTypes,
}) => {
  const [showExcludedModal, setShowExcludedModal] = useState(false);

  const addLine = () => {
    const newItem: LineItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      units: 1,
      type: packageTypes[0] || 'Pallets',
      weight: '' as any,
      weightUnit: 'lbs',
      length: '' as any,
      width: '' as any,
      height: '' as any,
      dimUnit: 'in',
      nmfcClass: '70',
      commodity: '',
      autoCalculatedClass: true,
    };
    onChange([...items, newItem]);
  };

  const removeLine = (index: number) => {
    if (items.length <= 1) {
      onChange([
        {
          id: `line-${Date.now()}`,
          units: 1,
          type: packageTypes[0] || 'Pallets',
          weight: '' as any,
          weightUnit: 'lbs',
          length: '' as any,
          width: '' as any,
          height: '' as any,
          dimUnit: 'in',
          nmfcClass: '70',
          commodity: '',
          autoCalculatedClass: true,
        },
      ]);
      return;
    }
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, val: any) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        const next = { ...item, [field]: val };

        // If dimensions or weight changed and auto-calculate is enabled, re-calculate NMFC class
        if (
          next.autoCalculatedClass !== false &&
          (field === 'length' ||
            field === 'width' ||
            field === 'height' ||
            field === 'weight' ||
            field === 'dimUnit' ||
            field === 'weightUnit')
        ) {
          const l = Number(field === 'length' ? val : next.length) || 0;
          const w = Number(field === 'width' ? val : next.width) || 0;
          const h = Number(field === 'height' ? val : next.height) || 0;
          const wt = Number(field === 'weight' ? val : next.weight) || 0;
          const du = (field === 'dimUnit' ? val : next.dimUnit) || 'in';
          const wu = (field === 'weightUnit' ? val : next.weightUnit) || 'lbs';

          const density = calculateDensityPcf(l, w, h, wt, du, wu);
          if (density !== null && density > 0) {
            next.nmfcClass = getNMFCClassFromDensity(density);
          }
        }

        return next;
      }
      return item;
    });
    onChange(updated);
  };

  const handleNumberInput = (index: number, field: keyof LineItem, rawVal: string, isInt = false) => {
    if (rawVal === '') {
      updateItem(index, field, '');
      return;
    }
    const parsed = isInt ? parseInt(rawVal, 10) : parseFloat(rawVal);
    if (!isNaN(parsed) && parsed >= 0) {
      updateItem(index, field, parsed);
    }
  };

  // Manual or explicit auto-calculate trigger
  const handleAutoCalculateClass = (index: number) => {
    const item = items[index];
    const l = Number(item.length) || 0;
    const w = Number(item.width) || 0;
    const h = Number(item.height) || 0;
    const wt = Number(item.weight) || 0;
    const density = calculateDensityPcf(l, w, h, wt, item.dimUnit, item.weightUnit, Number(item.units) || 1);

    const calcClass = getNMFCClassFromDensity(density);
    const updated = items.map((it, i) => {
      if (i === index) {
        return {
          ...it,
          nmfcClass: calcClass,
          autoCalculatedClass: true,
        };
      }
      return it;
    });
    onChange(updated);
  };

  // Calculate totals (Weight entered is TOTAL line item weight, not per unit)
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.units) || 0), 0);
  const totalWeightLbs = items.reduce((sum, item) => {
    const w = Number(item.weight) || 0;
    return sum + (item.weightUnit === 'kg' ? w * 2.20462 : w);
  }, 0);

  return (
    <div className="w-full space-y-4">
      {/* Excluded Commodities Modal */}
      <ExcludedCommoditiesModal
        isOpen={showExcludedModal}
        onClose={() => setShowExcludedModal(false)}
      />

      {/* Header with Title & Add Line button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600 dark:text-[#38BDF8]" />
            <span>
              Total Units: <strong className="text-slate-900 dark:text-white font-bold">{totalUnits}</strong>
            </span>
          </span>
          <span className="text-slate-400 dark:text-slate-600">&bull;</span>
          <span>
            Total Weight:{' '}
            <strong className="text-yellow-600 dark:text-[#FACC15] font-bold">
              {Math.round(totalWeightLbs).toLocaleString()}
            </strong>{' '}
            lbs
          </span>
        </div>

        <button
          id="btn-add-line"
          type="button"
          onClick={addLine}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Line Item</span>
        </button>
      </div>

      {/* Weight Guideline Note Banner */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-amber-900 dark:text-amber-200/90 text-xs leading-relaxed shadow-sm">
        <Info className="w-4 h-4 text-amber-600 dark:text-[#FACC15] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-950 dark:text-white uppercase tracking-wider block text-[11px] mb-0.5">
            Shipment Weight Notice (Total Combined Line Item Weight):
          </span>
          Weight entered is the <strong>TOTAL combined weight</strong> for that line item (not per individual unit or pallet). The system does <strong>not</strong> multiply units &times; weight. For example: If you have <strong>10 Pallets</strong> weighing <strong>15,000 lbs in total</strong>, enter <strong>15,000</strong>.
        </div>
      </div>

      {/* Line Items List */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const l = Number(item.length) || 0;
          const w = Number(item.width) || 0;
          const h = Number(item.height) || 0;
          const wt = Number(item.weight) || 0;
          const densityPcf = calculateDensityPcf(l, w, h, wt, item.dimUnit, item.weightUnit, Number(item.units) || 1);
          const densityDisplay = densityPcf !== null ? `${densityPcf.toFixed(1)} PCF` : '—';
          const suggestedClass = getNMFCClassFromDensity(densityPcf);

          return (
            <div
              key={item.id || index}
              className="lineitem-row p-4 sm:p-5 rounded-xl bg-slate-50/90 dark:bg-[#0B0F17]/80 border border-slate-200 dark:border-white/[0.1] hover:border-slate-300 dark:hover:border-white/[0.18] space-y-4 transition-all duration-200 shadow-sm"
            >
              {/* Row Top: Index badge, Commodity, Package Type, Delete button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="w-7 h-7 rounded-lg bg-yellow-400/20 border border-yellow-400/40 text-yellow-800 dark:text-[#FACC15] font-extrabold text-xs flex items-center justify-center font-mono">
                    #{index + 1}
                  </span>
                </div>

                {/* Commodity Description + Excluded Commodities Link */}
                <div className="commodity lineitem-inputs flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400">
                      Commodity Description <span className="text-yellow-600 dark:text-[#FACC15]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowExcludedModal(true)}
                      className="commodity-excluded text-[11px] text-sky-600 dark:text-[#38BDF8] hover:text-sky-700 dark:hover:text-[#7dd3fc] cursor-pointer"
                    >
                      List of <u>excluded commodities</u>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Machinery, Auto Parts, Electronics, Raw Plastics"
                    value={item.commodity}
                    onChange={(e) => updateItem(index, 'commodity', e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-lg text-sm placeholder-slate-400 dark:placeholder-slate-500 font-medium tracking-wide"
                  />
                </div>

                {/* Packaging Type */}
                <div className="w-full sm:w-48 shrink-0">
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Packaging Type
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(index, 'type', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                  >
                    {packageTypes.map((pt) => (
                      <option key={pt} value={pt} className="bg-white dark:bg-[#0A0C10] text-slate-900 dark:text-white">
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete / Clear Button */}
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors self-end sm:self-center mt-3 sm:mt-0 cursor-pointer"
                  title={items.length > 1 ? 'Delete line item' : 'Clear line item'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Row Bottom: Units, Weight, Dimensions (L x W x H), NMFC Class with Auto Calculate, Density */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs pt-1">
                {/* Units */}
                <div className="hucount lineitem-inputs">
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Units <span className="text-yellow-600 dark:text-[#FACC15]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1"
                    value={item.units === ('' as any) ? '' : item.units}
                    onChange={(e) => handleNumberInput(index, 'units', e.target.value, true)}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm font-bold text-center"
                  />
                </div>

                {/* Weight + Unit (Total combined weight) */}
                <div className="weight lineitem-inputs">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400" title="Total weight of all units in this line item">
                      Total Wt <span className="text-yellow-600 dark:text-[#FACC15]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(index, 'weightUnit', item.weightUnit === 'lbs' ? 'kg' : 'lbs')
                      }
                      className="text-[10px] font-bold text-sky-600 dark:text-[#38BDF8] hover:underline cursor-pointer"
                    >
                      [{item.weightUnit.toUpperCase()}]
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.weight === ('' as any) ? '' : item.weight}
                    onChange={(e) => handleNumberInput(index, 'weight', e.target.value, false)}
                    placeholder="Total lbs"
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm font-bold"
                  />
                </div>

                {/* Dimensions (Length x Width x Height) */}
                <div className="dimensions lineitem-inputs col-span-2 sm:col-span-2 md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400">
                      Dimensions: L &times; W &times; H ({item.dimUnit})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(index, 'dimUnit', item.dimUnit === 'in' ? 'cm' : 'in')
                      }
                      className="text-[10px] font-bold text-sky-600 dark:text-[#38BDF8] hover:underline cursor-pointer"
                    >
                      [{item.dimUnit.toUpperCase()}]
                    </button>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="1"
                      placeholder="L"
                      value={item.length === ('' as any) ? '' : item.length}
                      onChange={(e) => handleNumberInput(index, 'length', e.target.value, false)}
                      className="glass-input w-1/3 px-2 py-2 rounded-lg text-sm text-center font-medium"
                    />
                    <span className="text-slate-400 dark:text-slate-500 font-bold">&times;</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="W"
                      value={item.width === ('' as any) ? '' : item.width}
                      onChange={(e) => handleNumberInput(index, 'width', e.target.value, false)}
                      className="glass-input w-1/3 px-2 py-2 rounded-lg text-sm text-center font-medium"
                    />
                    <span className="text-slate-400 dark:text-slate-500 font-bold">&times;</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="H"
                      value={item.height === ('' as any) ? '' : item.height}
                      onChange={(e) => handleNumberInput(index, 'height', e.target.value, false)}
                      className="glass-input w-1/3 px-2 py-2 rounded-lg text-sm text-center font-medium"
                    />
                  </div>
                </div>

                {/* NMFC Freight Class with AUTO CALCULATE */}
                <div className="nmfc lineitem-inputs">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400">
                      NMFC Class
                    </label>
                    <button
                      type="button"
                      id={`btn-auto-calc-class-${index}`}
                      onClick={() => handleAutoCalculateClass(index)}
                      className="auto-calculate-class flex items-center space-x-1 text-[10px] font-bold text-yellow-600 dark:text-[#FACC15] hover:text-yellow-700 dark:hover:text-yellow-300 cursor-pointer"
                      title="Auto calculate freight class from density"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Auto Calc</span>
                    </button>
                  </div>
                  <select
                    value={item.nmfcClass}
                    onChange={(e) => {
                      updateItem(index, 'nmfcClass', e.target.value);
                      updateItem(index, 'autoCalculatedClass', false);
                    }}
                    className="glass-input w-full px-2 py-2 rounded-lg text-sm font-semibold cursor-pointer text-sky-700 dark:text-[#38BDF8]"
                  >
                    {nmfcClasses.map((cls) => (
                      <option key={cls} value={cls} className="bg-white dark:bg-[#0A0C10] text-slate-900 dark:text-white">
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Density Metric & Auto-calc Status */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400">
                      Density
                    </label>
                    {item.autoCalculatedClass !== false && densityPcf !== null && (
                      <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Auto</span>
                    )}
                  </div>
                  <div
                    className="glass-subtle w-full px-2 py-2 rounded-lg text-xs font-mono font-bold text-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]"
                    title={
                      densityPcf !== null
                        ? `${densityDisplay} → Standard NMFTA Class ${suggestedClass}`
                        : 'Enter Weight and Dimensions to calculate density'
                    }
                  >
                    {densityDisplay}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
