
import React from 'react';
import { TrendingMovie } from '../types';

interface TrendingMoviesProps {
  movies: TrendingMovie[];
  onSelectMovie: (title: string) => void;
  isLoading: boolean;
}

const TrendingMovies: React.FC<TrendingMoviesProps> = ({ movies, onSelectMovie, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-6"></div>
        <div className="flex gap-4 overflow-x-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[280px] h-[160px] bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-cinzel font-bold text-slate-300 flex items-center gap-2">
          <i className="fa-solid fa-fire text-amber-500"></i>
          Trending Now
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Click to compare</span>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {movies.map((movie, idx) => (
          <button
            key={idx}
            onClick={() => onSelectMovie(movie.title)}
            className="min-w-[280px] text-left group bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:border-amber-500/50 hover:bg-slate-800/40 transition-all active:scale-95"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                {movie.genre}
              </span>
              <span className="text-[10px] font-bold text-amber-500">
                <i className="fa-solid fa-star mr-1"></i>{movie.rating}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-1 uppercase tracking-tight">
              {movie.title}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {movie.description}
            </p>
            <div className="mt-4 flex items-center text-amber-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Find Tickets <i className="fa-solid fa-arrow-right ml-2"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingMovies;
