import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { LocationSuggestion } from '../types';

interface LocationAutocompleteProps {
  id?: string;
  label: string;
  value: string;
  zipValue: string;
  placeholder?: string;
  onChange: (location: string, zip: string) => void;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  id,
  label,
  value,
  placeholder = 'Enter 5-digit ZIP or City, State',
  onChange,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
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
        const res = await fetch(`/api/locations/autocomplete?q=${encodeURIComponent(inputValue)}`);
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
  }, [inputValue, isOpen]);

  const handleSelect = (item: LocationSuggestion) => {
    setInputValue(item.formatted);
    onChange(item.formatted, item.zip);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);

    // If direct 5 digit zip
    const zipMatch = val.match(/\b\d{5}\b/);
    const extractedZip = zipMatch ? zipMatch[0] : val.replace(/\D/g, '').slice(0, 5);
    onChange(val, extractedZip);
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label} {required && <span className="text-[#FACC15]">*</span>}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <MapPin className="w-4 h-4 text-[#38BDF8]" />
        </div>
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="glass-input w-full pl-10 pr-10 py-3 rounded-lg text-sm text-white placeholder-slate-500 font-medium tracking-wide shadow-sm"
          autoComplete="off"
        />
        <div className="absolute right-3.5 text-slate-400 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#FACC15]" />
          ) : (
            <Search className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#0B0F17]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/[0.12] overflow-hidden max-h-60 overflow-y-auto">
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
