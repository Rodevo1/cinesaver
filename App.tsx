
import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import MovieResults from './components/MovieResults';
import TrendingMovies from './components/TrendingMovies';
import LoadingSkeleton from './components/LoadingSkeleton';
import { fetchMovieTickets, fetchTrendingMovies, fetchOmdbData, fetchMovieSuggestions } from './services/geminiService';
import { TheaterInfo, SearchParams, GroundingSource, TrendingMovie, OmdbData, MovieSuggestion } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [results, setResults] = useState<TheaterInfo[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [movieName, setMovieName] = useState('');
  const [theaterName, setTheaterName] = useState('');
  const [omdbData, setOmdbData] = useState<OmdbData | null>(null);
  const [city, setCity] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);

  useEffect(() => {
    if (city) {
      const loadTrending = async () => {
        setTrendingLoading(true);
        try {
          const movies = await fetchTrendingMovies(city);
          movies.length > 0 && setTrendingMovies(movies);
        } catch (err) {
          console.error("Failed to load trending movies", err);
        } finally {
          setTrendingLoading(false);
        }
      };
      loadTrending();
    }
  }, [city]);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setMovieName(params.movieName);
    setTheaterName(params.theaterName || '');
    setCity(params.city);
    setHasSearched(true);
    setOmdbData(null);
    setSuggestions([]);
    
    try {
      const [data, omdb] = await Promise.all([
        fetchMovieTickets(params),
        params.movieName ? fetchOmdbData(params.movieName) : Promise.resolve(null)
      ]);
      
      setResults(data.results);
      setSources(data.sources);
      setOmdbData(omdb);

      if (params.movieName && data.results.length === 0) {
        const altSuggestions = await fetchMovieSuggestions(params.movieName);
        setSuggestions(altSuggestions);
      }
    } catch (err) {
      console.error(err);
      setError("Cinema Link Interrupted. We couldn't fetch current ticket data for this query.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingSelect = (title: string) => {
    const searchParams: SearchParams = {
      movieName: title,
      city: city || 'New York',
      startTime: '18:00',
      endTime: '22:00'
    };
    handleSearch(searchParams);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 pt-12 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20 transform -rotate-6">
              <i className="fa-solid fa-camera-movie text-slate-950 text-xl sm:text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-cinzel font-bold tracking-tighter">
                Cine<span className="gold-text">Saver</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest -mt-1">Premier Price Hunter</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live comparison active</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 py-12 relative z-10 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-6xl font-cinzel font-bold mb-6 text-white leading-tight">
              NEVER OVERPAY FOR <br />
              <span className="gold-text">THE BIG SCREEN</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-lg max-w-xl mx-auto leading-relaxed">
              Real-time showtimes and ticket price comparison. 
              Search by <span className="text-amber-500">Movie</span>, <span className="text-amber-500">Theater</span>, or <span className="text-amber-500">Mall</span>.
            </p>
          </div>

          <SearchForm onSearch={handleSearch} isLoading={loading} />

          <div className="mt-12">
            <TrendingMovies 
              movies={trendingMovies} 
              onSelectMovie={handleTrendingSelect} 
              isLoading={trendingLoading} 
            />
          </div>

          {error && (
            <div className="mt-8 bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-2xl flex items-center gap-4">
              <i className="fa-solid fa-circle-exclamation text-2xl"></i>
              <p className="font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            hasSearched && (
              <MovieResults 
                results={results} 
                sources={sources} 
                movieName={movieName || (theaterName ? `Now Playing at ${theaterName}` : city)} 
                omdbData={omdbData}
                suggestions={suggestions}
                onSelectSuggestion={handleTrendingSelect}
              />
            )
          )}

          {!loading && !hasSearched && !error && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800 hover:border-amber-500/50 transition-all group">
                <i className="fa-solid fa-magnifying-glass-dollar text-2xl sm:text-3xl text-amber-500 mb-4 group-hover:scale-110 transition-transform block"></i>
                <h3 className="text-base sm:text-lg font-bold mb-2">Theater Finder</h3>
                <p className="text-slate-400 text-[10px] sm:text-sm">Find what's playing at your favorite malls or local chains instantly.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800 hover:border-amber-500/50 transition-all group">
                <i className="fa-solid fa-bolt text-2xl sm:text-3xl text-amber-500 mb-4 group-hover:scale-110 transition-transform block"></i>
                <h3 className="text-base sm:text-lg font-bold mb-2">Real-time Data</h3>
                <p className="text-slate-400 text-[10px] sm:text-sm">Powered by AI to ensure you get the latest pricing and session availability.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800 hover:border-amber-500/50 transition-all group">
                <i className="fa-solid fa-shield-heart text-2xl sm:text-3xl text-amber-500 mb-4 group-hover:scale-110 transition-transform block"></i>
                <h3 className="text-base sm:text-lg font-bold mb-2">Pinpoint Search</h3>
                <p className="text-slate-400 text-[10px] sm:text-sm">Specifically search for malls to find the best screening after your shopping trip.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-slate-900 relative z-10">
        <div className="text-center">
          <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em]">
            © 2025 CineSaver. Global Price Comparison.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
