import React from 'react';
import { Plus, Trash2, Box, Layers, HelpCircle } from 'lucide-react';
import { LineItem } from '../types';

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
        },
      ]);
      return;
    }
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, val: any) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: val };
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

  // Calculate totals
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.units) || 0), 0);
  const totalWeightLbs = items.reduce((sum, item) => {
    const w = Number(item.weight) || 0;
    const units = Number(item.units) || 1;
    return sum + (item.weightUnit === 'kg' ? w * 2.20462 : w) * units;
  }, 0);

  return (
    <div className="w-full space-y-4">
      {/* Header with Title & Add Line button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#38BDF8]" />
            <span>Total Units: <strong className="text-white font-bold">{totalUnits}</strong></span>
          </span>
          <span className="text-slate-600">&bull;</span>
          <span>
            Total Weight: <strong className="text-[#FACC15] font-bold">{Math.round(totalWeightLbs).toLocaleString()}</strong> lbs
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

      {/* Line Items List */}
      <div className="space-y-4">
        {items.map((item, index) => {
          // Calculate density (lbs per cubic foot)
          const l = Number(item.length) || 0;
          const w = Number(item.width) || 0;
          const h = Number(item.height) || 0;
          const cuInches = l * w * h;
          const cuFt = item.dimUnit === 'cm' ? cuInches / 28316.8 : cuInches / 1728;
          const weightNum = Number(item.weight) || 0;
          const weightLbs = item.weightUnit === 'kg' ? weightNum * 2.20462 : weightNum;
          const density = cuFt > 0 && weightLbs > 0 ? (weightLbs / cuFt).toFixed(1) : '—';

          return (
            <div
              key={item.id || index}
              className="p-4 sm:p-5 rounded-xl bg-[#0B0F17]/80 border border-white/[0.1] hover:border-white/[0.18] space-y-4 transition-all duration-200 shadow-sm"
            >
              {/* Row Top: Index badge, Commodity, Package Type, Delete button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="w-7 h-7 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-[#FACC15] font-extrabold text-xs flex items-center justify-center font-mono">
                    #{index + 1}
                  </span>
                </div>

                {/* Commodity Description */}
                <div className="flex-1 w-full">
                  <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">
                    Commodity Description <span className="text-[#FACC15]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Machinery, Auto Parts, Electronics, Raw Plastics"
                    value={item.commodity}
                    onChange={(e) => updateItem(index, 'commodity', e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-lg text-sm placeholder-slate-500 font-medium tracking-wide"
                  />
                </div>

                {/* Packaging Type */}
                <div className="w-full sm:w-48 shrink-0">
                  <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">
                    Packaging Type
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(index, 'type', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                  >
                    {packageTypes.map((pt) => (
                      <option key={pt} value={pt} className="bg-[#0A0C10] text-white">
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete / Clear Button */}
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-white/[0.06] transition-colors self-end sm:self-center mt-3 sm:mt-0"
                  title={items.length > 1 ? 'Delete line item' : 'Clear line item'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Row Bottom: Units, Weight, Dimensions (L x W x H), NMFC Class, Density */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs pt-1">
                {/* Units */}
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">
                    Units <span className="text-[#FACC15]">*</span>
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

                {/* Weight + Unit */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-semibold text-slate-400">
                      Weight <span className="text-[#FACC15]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => updateItem(index, 'weightUnit', item.weightUnit === 'lbs' ? 'kg' : 'lbs')}
                      className="text-[10px] font-bold text-[#38BDF8] hover:underline cursor-pointer"
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
                    placeholder="e.g. 650"
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm font-bold"
                  />
                </div>

                {/* Dimensions (Length x Width x Height) */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-semibold text-slate-400">
                      Dimensions: L &times; W &times; H ({item.dimUnit})
                    </label>
                    <button
                      type="button"
                      onClick={() => updateItem(index, 'dimUnit', item.dimUnit === 'in' ? 'cm' : 'in')}
                      className="text-[10px] font-bold text-[#38BDF8] hover:underline cursor-pointer"
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
                    <span className="text-slate-500 font-bold">&times;</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="W"
                      value={item.width === ('' as any) ? '' : item.width}
                      onChange={(e) => handleNumberInput(index, 'width', e.target.value, false)}
                      className="glass-input w-1/3 px-2 py-2 rounded-lg text-sm text-center font-medium"
                    />
                    <span className="text-slate-500 font-bold">&times;</span>
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

                {/* NMFC Freight Class */}
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">
                    Freight Class
                  </label>
                  <select
                    value={item.nmfcClass}
                    onChange={(e) => updateItem(index, 'nmfcClass', e.target.value)}
                    className="glass-input w-full px-2 py-2 rounded-lg text-sm font-semibold cursor-pointer text-[#38BDF8]"
                  >
                    {nmfcClasses.map((cls) => (
                      <option key={cls} value={cls} className="bg-[#0A0C10] text-white">
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Density Metric */}
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">
                    Density (PCF)
                  </label>
                  <div className="glass-subtle w-full px-3 py-2 rounded-lg text-sm font-mono font-bold text-center text-slate-300 border border-white/[0.08]">
                    {density}
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
