
import React, { useState } from 'react';
import { fetchMovieVaultData, fetchOmdbData } from '../services/geminiService';
import { CriticalReview, SimilarMovie } from '../types';
import MovieAutocomplete from './MovieAutocomplete';

interface ReviewsViewProps {
  onSelectTrending: (title: string) => void;
}

const ReviewsView: React.FC<ReviewsViewProps> = ({ onSelectTrending }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [externalReviews, setExternalReviews] = useState<CriticalReview[]>([]);
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mainImgLoaded, setMainImgLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'critics' | 'audience'>('critics');

  const performSearch = async (title: string) => {
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setExternalReviews([]);
    setSimilarMovies([]);
    setMainImgLoaded(false);
    setActiveTab('critics');

    try {
      const vaultData = await fetchMovieVaultData(title);

      if (vaultData && vaultData.movie) {
        setData(vaultData.movie);
        setExternalReviews(vaultData.reviews || []);
        
        if (vaultData.similar) {
          const enhancedSimilar = await Promise.all(vaultData.similar.map(async (m: any) => {
            const sOmdb = await fetchOmdbData(m.title);
            return {
              ...m,
              poster: sOmdb?.Poster && sOmdb.Poster !== 'N/A' ? sOmdb.Poster : `https://placehold.co/200x300/0f172a/f59e0b?text=${encodeURIComponent(m.title)}`
            };
          }));
          setSimilarMovies(enhancedSimilar);
        }
        
        setQuery(vaultData.movie.Title);
      } else {
        setError("The archives are empty for this title. Please try another cinematic masterpiece.");
      }
    } catch (err) {
      setError("Communication with the vault was interrupted. Please check your link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="text-center mb-16 relative">
        <h2 className="text-5xl md:text-8xl font-cinzel font-bold mb-4 text-white leading-tight uppercase tracking-tighter">
          Movie <span className="gold-text">Vault</span>
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.5em] max-w-xl mx-auto leading-relaxed">
          The ultimate cross-referenced review dossier
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-20">
        <form onSubmit={handleSearch} className="relative group">
          <MovieAutocomplete
            placeholder="Search movie title..."
            className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800 text-white rounded-3xl px-10 py-6 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all pr-24 text-2xl font-light shadow-2xl"
            value={query}
            onChange={(val) => setQuery(val)}
            onSelect={(movie) => performSearch(movie.Title)}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(217,119,6,0.3)] z-10 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin text-2xl"></i> : <i className="fa-solid fa-magnifying-glass text-2xl"></i>}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-8 rounded-3xl text-center max-w-lg mx-auto mb-12 animate-in zoom-in-95">
          <p className="font-medium tracking-wide">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
          
          {/* Hero Section with Backdrop */}
          {data.Backdrop && (
            <div className="relative w-full h-[300px] md:h-[500px] rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl">
              <img 
                src={data.Backdrop} 
                alt="" 
                className="w-full h-full object-cover opacity-30 scale-110 blur-sm"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12 flex flex-col items-start gap-4">
                <div className="flex gap-3">
                  {data.MoodTags?.map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] font-black border border-amber-500/40 text-amber-500 bg-slate-950/80 px-3 py-1 rounded-full uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
                <h1 className="text-5xl md:text-9xl font-cinzel font-bold text-white uppercase tracking-tighter leading-none">{data.Title}</h1>
                <p className="text-amber-500 text-xl font-bold tracking-[0.2em] uppercase italic opacity-80">{data.Tagline}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 space-y-10">
               <div className={`relative group rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl cinema-glow ${!mainImgLoaded ? 'shimmer-bg' : ''}`}>
                 <img 
                   src={data.Poster} 
                   alt={data.Title} 
                   onLoad={() => setMainImgLoaded(true)}
                   loading="lazy"
                   decoding="async"
                   className={`w-full aspect-[2/3] object-cover transition-all duration-1000 group-hover:scale-105 ${mainImgLoaded ? 'img-loaded' : 'img-loading'}`}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                 <div className="absolute bottom-10 left-10 right-10">
                   <h3 className="text-4xl font-cinzel font-bold text-white leading-tight uppercase">{data.Year}</h3>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 gap-6 bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/50">
                 <h4 className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Technical Dossier</h4>
                 {[
                   { label: 'Runtime', value: data.Runtime, icon: 'fa-clock' },
                   { label: 'Box Office', value: data.BoxOffice, icon: 'fa-vault' },
                   { label: 'Audience Score', value: `${data.imdbRating}/10`, icon: 'fa-users' }
                 ].map((spec, i) => spec.value && spec.value !== 'N/A' && (
                   <div key={i} className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 border border-slate-700">
                        <i className={`fa-solid ${spec.icon} text-xs`}></i>
                     </div>
                     <div className="min-w-0">
                       <div className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1">{spec.label}</div>
                       <div className="text-slate-100 font-bold text-sm leading-snug truncate">{spec.value}</div>
                     </div>
                   </div>
                 ))}
               </div>

               <button 
                  onClick={() => onSelectTrending(data.Title)} 
                  className="w-full py-6 rounded-2xl gold-gradient text-slate-950 font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl"
               >
                  <i className="fa-solid fa-ticket"></i>
                  Find Lowest Prices
               </button>
            </div>

            {/* Right Main Content */}
            <div className="lg:col-span-8 space-y-12">
              <section className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/40 to-transparent"></div>
                <h4 className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Official Synopsis</h4>
                <p className="text-slate-200 text-2xl md:text-3xl leading-snug font-light italic tracking-tight opacity-95">
                  {data.Plot}
                </p>
              </section>

              {/* Review Tabs */}
              <section className="space-y-8">
                <div className="flex items-center gap-6 border-b border-slate-800 pb-1">
                  <button 
                    onClick={() => setActiveTab('critics')}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'critics' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Critic Consensus
                    {activeTab === 'critics' && <div className="absolute bottom-0 left-0 w-full h-1 gold-gradient rounded-full"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('audience')}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'audience' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Audience Voice
                    {activeTab === 'audience' && <div className="absolute bottom-0 left-0 w-full h-1 gold-gradient rounded-full"></div>}
                  </button>
                </div>

                {activeTab === 'critics' ? (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="bg-slate-900/60 p-8 rounded-3xl border border-amber-500/10 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                          <i className="fa-solid fa-quote-right text-7xl text-amber-500"></i>
                       </div>
                       <h5 className="text-amber-500/60 text-[10px] font-black uppercase tracking-widest mb-4">The Verdict</h5>
                       <p className="text-white text-xl md:text-2xl font-cinzel leading-relaxed">{data.Consensus}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {externalReviews.map((rev, i) => (
                        <div key={i} className="bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/50 hover:bg-slate-800/20 transition-all group flex flex-col justify-between h-full">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">{rev.score}</div>
                              <i className="fa-solid fa-feather-pointed text-slate-700 opacity-40"></i>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">"{rev.summary}"</p>
                          </div>
                          <div className="flex justify-between items-end mt-auto">
                            <div>
                              <div className="text-white font-bold text-sm">{rev.source}</div>
                              <div className="text-slate-500 text-[9px] uppercase font-black tracking-widest">{rev.author}</div>
                            </div>
                            <a href={rev.url} target="_blank" className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all">
                               <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
                    {data.UserReviews && data.UserReviews.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {data.UserReviews.map((rev: any, i: number) => (
                          <div key={i} className="bg-slate-900/30 p-10 rounded-[2.5rem] border border-slate-800/50 space-y-6">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 font-black text-lg">
                                   {rev.author.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-white font-bold">{rev.author}</div>
                                  <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest">TMDb Community Reviewer</div>
                                </div>
                              </div>
                              <div className="text-amber-500 font-cinzel font-bold text-xl">{rev.rating}</div>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 italic">"{rev.content}"</p>
                            <a href={rev.url} target="_blank" className="inline-block text-[10px] text-amber-500/60 uppercase font-black tracking-widest border-b border-amber-500/20 pb-1 hover:text-amber-500 transition-colors">Read Full Account</a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                         <i className="fa-solid fa-ghost text-4xl text-slate-800 mb-4 block"></i>
                         <p className="text-slate-500 text-sm italic">The community has yet to voice their opinion on this title.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Cast Gallery */}
              {data.FullCast && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h4 className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap">The Ensemble</h4>
                    <div className="h-[1px] flex-grow bg-slate-800/50"></div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                    {data.FullCast.map((actor: any, i: number) => (
                      <div key={i} className="min-w-[140px] group text-center space-y-3">
                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-800 group-hover:border-amber-500/50 transition-all">
                          {actor.profilePath ? (
                            <img src={actor.profilePath} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={actor.name} />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700">
                               <i className="fa-solid fa-user text-3xl"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[11px] text-white font-bold group-hover:text-amber-400 transition-colors uppercase leading-tight">{actor.name}</div>
                          <div className="text-slate-500 text-[9px] uppercase tracking-tighter line-clamp-1">{actor.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {similarMovies.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h4 className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap">Suggested Cinema</h4>
                    <div className="h-[1px] flex-grow bg-slate-800/50"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {similarMovies.map((movie, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setQuery(movie.title); performSearch(movie.title); }}
                        className="group text-left space-y-3"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-slate-800 group-hover:border-amber-500/50 transition-all bg-slate-900 shimmer-bg">
                          <img 
                            src={movie.poster} 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            alt={movie.title} 
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <i className="fa-solid fa-eye text-white text-2xl"></i>
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-white font-bold truncate group-hover:text-amber-400 transition-colors uppercase tracking-tight">{movie.title}</div>
                          <div className="text-slate-500 text-[9px] font-black">{movie.year}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsView;
