
import React, { useState } from 'react';
import { SearchParams } from '../types';
import MovieAutocomplete from './MovieAutocomplete';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [params, setParams] = useState<SearchParams>({
    movieName: '',
    theaterName: '',
    city: '',
    startTime: '18:00',
    endTime: '22:00',
  });
  const [locating, setLocating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasMovie = params.movieName.trim().length > 0;
    const hasTheater = params.theaterName.trim().length > 0;
    const hasCity = params.city.trim().length > 0;

    // Validation: If a specific Movie or Theater is provided, City is MANDATORY for local accuracy.
    if ((hasMovie || hasTheater) && !hasCity) {
      const target = hasMovie ? "movie prices" : "mall showtimes";
      alert(`Please enter a City to help us find ${target} accurately in your area.`);
      return;
    }

    // General validation check: At least one field must be filled
    if (hasMovie || hasTheater || hasCity) {
      onSearch(params);
    } else {
      alert("Please provide at least a Movie Name, a Mall/Theater, or a City to search.");
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
          setParams(p => ({ ...p, city }));
        } catch (err) {
          console.error("Location detection failed", err);
        } finally { 
          setLocating(false); 
        }
      },
      () => {
        setLocating(false);
        alert("Location access denied. Please enter your city manually.");
      }
    );
  };

  const isCityMandatory = params.movieName.trim().length > 0 || params.theaterName.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 sm:p-8 rounded-[2rem] cinema-glow animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Movie Name</label>
          <MovieAutocomplete
            placeholder="Search title (Optional)"
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            value={params.movieName}
            onChange={val => setParams(p => ({ ...p, movieName: val }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Theater / Mall</label>
          <input
            type="text"
            placeholder="e.g. Grand Mall"
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            value={params.theaterName}
            onChange={e => setParams(p => ({ ...p, theaterName: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-2 relative">
          <label className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
            City {isCityMandatory && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={isCityMandatory ? "City is required for this search" : "e.g. New York (Optional)"}
              className={`w-full bg-slate-950 border text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all pr-12 ${isCityMandatory && !params.city.trim() ? 'border-amber-500/30' : 'border-slate-700'}`}
              value={params.city}
              onChange={e => setParams(p => ({ ...p, city: e.target.value }))}
            />
            <button
              type="button"
              onClick={handleUseLocation}
              title="Use Current Location"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
            >
              <i className={`fa-solid ${locating ? 'fa-spinner fa-spin' : 'fa-location-dot'}`}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">From</label>
          <input
            type="time"
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            value={params.startTime}
            onChange={e => setParams(p => ({ ...p, startTime: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Until</label>
          <input
            type="time"
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            value={params.endTime}
            onChange={e => setParams(p => ({ ...p, endTime: e.target.value }))}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-8 w-full gold-gradient text-slate-950 font-black py-4 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest shadow-xl shadow-amber-900/20"
      >
        {isLoading ? (
          <><i className="fa-solid fa-compact-disc fa-spin"></i> Locating Tickets...</>
        ) : (
          <><i className="fa-solid fa-ticket"></i> {params.theaterName && !params.movieName ? 'Explore Mall Movies' : 'Find Lowest Prices'}</>
        )}
      </button>
    </form>
  );
};

export default SearchForm;
