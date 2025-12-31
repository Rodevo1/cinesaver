
import React, { useState } from 'react';
import { TheaterInfo, GroundingSource, OmdbData, MovieSuggestion } from '../types';

interface MovieResultsProps {
  results: TheaterInfo[];
  sources: GroundingSource[];
  movieName: string;
  omdbData: OmdbData | null;
  suggestions?: MovieSuggestion[];
  onSelectSuggestion?: (title: string) => void;
}

const MovieResults: React.FC<MovieResultsProps> = ({ results, sources, movieName, omdbData, suggestions = [], onSelectSuggestion }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (results.length === 0) {
    return (
      <div className="mt-12 bg-slate-900/40 p-12 text-center border border-dashed border-white/10 rounded-[2rem]">
        <h3 className="text-xl font-bold uppercase tracking-widest text-slate-500">No Tickets Found</h3>
        <p className="text-slate-600 mt-2 text-xs uppercase tracking-widest">Try adjusting your time window or city.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-8 sm:space-y-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Data - Optimized for Mobile visibility */}
        <div className="w-full lg:w-64 shrink-0 space-y-6 lg:space-y-8">
          <div className="flex flex-row lg:flex-col gap-4 items-center lg:items-start">
            {omdbData?.Poster && omdbData.Poster !== 'N/A' && (
              <div className="w-20 h-28 sm:w-32 sm:h-48 lg:w-full lg:h-auto rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl cinema-glow shrink-0">
                <img 
                  src={omdbData.Poster} 
                  className={`w-full h-full lg:aspect-[2/3] object-cover ${imgLoaded ? 'img-loaded' : 'img-loading'}`} 
                  onLoad={() => setImgLoaded(true)}
                  alt=""
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
               <h4 className="text-[9px] sm:text-[10px] font-black uppercase text-amber-500 tracking-[0.2em]">Metadata Stats</h4>
               <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest space-y-2 sm:space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-1 sm:pb-2">
                    <span className="text-slate-500">Score</span>
                    <span className="font-bold text-slate-100">{omdbData?.imdbRating || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 sm:pb-2">
                    <span className="text-slate-500">Sessions</span>
                    <span className="font-bold text-amber-500">{results.length}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Results Container - Redesigned to fit mobile screen without horizontal scroll */}
        <div className="flex-1 w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl lg:rounded-[2rem] overflow-hidden cinema-glow">
          <div className="bg-slate-950/40 px-5 py-4 border-b border-white/5 flex justify-between items-center">
             <h3 className="font-bold text-[9px] sm:text-xs uppercase tracking-[0.2em] truncate pr-2">{movieName}</h3>
             <span className="text-[7px] sm:text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0">Live Feed</span>
          </div>
          
          <div className="divide-y divide-white/5">
            {results.map((theater, idx) => (
              <div key={idx} className="p-4 sm:p-6 hover:bg-white/5 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Theater Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <div className="font-bold text-slate-100 text-[11px] sm:text-xs tracking-tight truncate">
                      {theater.name}
                    </div>
                    {/* Price and Showtime for mobile (visible on tiny screens next to name) */}
                    <div className="sm:hidden flex items-center gap-2 shrink-0">
                      <span className={`font-mono font-bold text-[11px] ${theater.isCheapest ? 'text-amber-500' : 'text-slate-300'}`}>
                        {theater.currencySymbol}{theater.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-500 mt-1 uppercase tracking-[0.05em] line-clamp-1 italic font-medium">
                    {theater.address}
                  </div>
                </div>

                {/* Session & Price Section - Desktop & Tablet Layout */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 shrink-0">
                  {/* Showtime Pill */}
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-clock text-[8px] text-amber-500/50 sm:hidden"></i>
                    <span className="bg-slate-800/80 px-2 py-1 rounded-lg font-mono text-[9px] sm:text-xs border border-white/5 text-slate-300">
                      {theater.showtime}
                    </span>
                  </div>

                  {/* Price and Book Action */}
                  <div className="flex items-center gap-3">
                    <div className={`hidden sm:block font-mono font-bold text-sm sm:text-lg ${theater.isCheapest ? 'text-amber-500' : 'text-white'}`}>
                      {theater.currencySymbol}{theater.price.toFixed(2)}
                    </div>
                    <a 
                      href={theater.bookingUrl} 
                      target="_blank" 
                      className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase transition-all tracking-widest border border-amber-500/20"
                    >
                      Book
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieResults;
