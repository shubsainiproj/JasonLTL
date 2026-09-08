import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, ChevronDown } from 'lucide-react';
import { LocationSuggestion } from '../types';

interface LocationAutocompleteProps {
  id?: string;
  label: string;
  value: string;
  zipValue: string;
  country?: 'US' | 'CA';
  onCountryChange?: (country: 'US' | 'CA') => void;
  placeholder?: string;
  onChange: (location: string, zip: string) => void;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  id,
  label,
  value,
  country = 'US',
  onCountryChange,
  placeholder,
  onChange,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  const effectivePlaceholder =
    placeholder || (country === 'CA' ? 'Enter Canadian Postal Code or City' : 'Enter 5-digit ZIP or City, State');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!isOpen || inputValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/locations/autocomplete?q=${encodeURIComponent(inputValue)}&country=${country}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue, isOpen, country]);

  const handleSelect = (item: LocationSuggestion) => {
    setInputValue(item.formatted);
    onChange(item.formatted, item.zip);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);

    if (country === 'CA') {
      const caMatch = val.match(/[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/);
      const extractedZip = caMatch ? caMatch[0].toUpperCase() : val.trim().slice(0, 7);
      onChange(val, extractedZip);
    } else {
      const zipMatch = val.match(/\b\d{5}\b/);
      const extractedZip = zipMatch ? zipMatch[0] : val.replace(/\D/g, '').slice(0, 5);
      onChange(val, extractedZip);
    }
  };

  const handleCountrySelect = (c: 'US' | 'CA') => {
    if (onCountryChange) {
      onCountryChange(c);
    }
    setCountryDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5 stop-selector">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-[#FACC15]">*</span>}
        </label>
        <span className="text-[11px] text-slate-400 font-mono">
          {country === 'US' ? 'United States' : 'Canada'}
        </span>
      </div>

      <div className="relative flex items-stretch rounded-xl shadow-sm bg-[#0B0F17]/80 border border-white/[0.12] focus-within:border-yellow-400/60 focus-within:ring-1 focus-within:ring-yellow-400/40 transition-all location-selector-container">
        {/* Country Selector Dropdown */}
        <div ref={countryRef} className="relative stop-selector__country shrink-0">
          <button
            type="button"
            onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
            className="h-full px-3 py-2.5 flex items-center space-x-1.5 bg-white/[0.04] hover:bg-white/[0.08] border-r border-white/[0.1] text-slate-200 text-xs font-bold transition-colors cursor-pointer rounded-l-xl rc-select"
            title={`Country: ${country}`}
          >
            <span className="rc-select__selected-option">{country}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {countryDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-[#0B0F17] border border-white/[0.15] rounded-xl shadow-2xl overflow-hidden py-1 w-28 animate-in fade-in duration-100">
              <button
                type="button"
                onClick={() => handleCountrySelect('US')}
                className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  country === 'US' ? 'bg-yellow-400/20 text-[#FACC15]' : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <span>US (USA)</span>
                {country === 'US' && <span className="text-xs">&bull;</span>}
              </button>
              <button
                type="button"
                onClick={() => handleCountrySelect('CA')}
                className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  country === 'CA' ? 'bg-yellow-400/20 text-[#FACC15]' : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <span>CA (Canada)</span>
                {country === 'CA' && <span className="text-xs">&bull;</span>}
              </button>
            </div>
          )}
        </div>

        {/* Input Pin Icon */}
        <div className="flex items-center pl-3 text-slate-400 pointer-events-none">
          <MapPin className="w-4 h-4 text-[#38BDF8]" />
        </div>

        {/* Text Input */}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={effectivePlaceholder}
          required={required}
          className="w-full bg-transparent pl-2.5 pr-10 py-3 text-sm text-white placeholder-slate-500 font-medium tracking-wide outline-none border-none"
          autoComplete="off"
        />

        {/* Search / Spinner Icon */}
        <div className="flex items-center pr-3.5 text-slate-400 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#FACC15]" />
          ) : (
            <Search className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#0B0F17]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/[0.15] overflow-hidden max-h-60 overflow-y-auto">
          <div className="p-1.5 space-y-1">
            {suggestions.map((item) => (
              <button
                key={`${item.zip}-${item.city}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/[0.08] transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-[#38BDF8] group-hover:bg-[#FACC15] transition-colors shrink-0" />
                  <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white font-medium truncate">
                    {item.city}, {item.state}
                  </span>
                </div>
                <span className="tag-yellow text-[11px] shrink-0 ml-2 font-mono">
                  {item.zip}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
