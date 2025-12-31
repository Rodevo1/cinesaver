
import React, { useState, useEffect, useRef } from 'react';
import { fetchMovieSuggestions } from '../services/geminiService';

interface MovieAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  onSelect?: (movie: any) => void;
}

const MovieAutocomplete: React.FC<MovieAutocompleteProps> = ({ value, onChange, placeholder, className, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      const results = await fetchMovieSuggestions(value);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (movie: any) => {
    onChange(movie.Title);
    setShowDropdown(false);
    if (onSelect) onSelect(movie);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className={`${className} pr-12`}
          value={value}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
           {loading && <i className="fa-solid fa-spinner fa-spin text-amber-500 text-xs"></i>}
           {!loading && value.length >= 2 && <i className="fa-solid fa-wand-magic-sparkles text-amber-500/40 text-xs"></i>}
        </div>
      </div>
      
      {showDropdown && (
        <div className="absolute z-[100] mt-3 w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
            <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Predictions</span>
            <span className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Match: "{value}"</span>
          </div>
          <ul className="max-h-[300px] overflow-y-auto">
            {suggestions.map((movie, idx) => (
              <li 
                key={movie.imdbID || idx}
                className="hover:bg-amber-500/10 cursor-pointer transition-colors border-b border-white/5 last:border-0 group"
                onClick={() => handleSelect(movie)}
              >
                <div className="flex items-center gap-4 p-3">
                  <div className="relative shrink-0 w-8 h-12 bg-slate-800 rounded overflow-hidden">
                    <img 
                      src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/40x60/0f172a/f59e0b?text=?'} 
                      alt="" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-bold text-xs uppercase tracking-widest group-hover:text-amber-400 transition-colors truncate">
                      {movie.Title}
                    </div>
                    <div className="text-slate-500 text-[10px]">{movie.Year}</div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-700 text-[10px] group-hover:text-amber-500 transition-colors"></i>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MovieAutocomplete;
