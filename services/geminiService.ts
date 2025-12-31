
import { GoogleGenAI, Type } from "@google/genai";
import { SearchParams, TheaterInfo, GroundingSource, TrendingMovie, OmdbData, CriticalReview, SimilarMovie } from "../types";

const OMDB_API_KEY = 'ccb7692'; 
const TMDB_API_KEY = 'a07e22bc1d8624c8fcca57dd33d2ff7b'; // Standard public demo key for TMDb

export const fetchMovieTickets = async (params: SearchParams): Promise<{ results: TheaterInfo[], sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  const locationPart = params.city ? `specifically in the city of "${params.city}" and its surrounding suburbs` : "near the user's likely location";
  const yearContext = "in the current year 2025";

  if (params.movieName && params.theaterName) {
    prompt = `Find movie ticket prices and showtimes for the movie "${params.movieName}" ${yearContext} at the specific theater or mall venue named "${params.theaterName}" ${locationPart} today between ${params.startTime} and ${params.endTime}.`;
  } else if (params.movieName) {
    prompt = `Exhaustively find all movie ticket prices and showtimes for "${params.movieName}" ${yearContext} ${locationPart} today between ${params.startTime} and ${params.endTime}. You MUST include results from EVERY available theater: major chains (AMC, Regal, Cinemark, Cineplex, VOX, PVR), boutique theaters (Alamo Drafthouse, Everyman, Curzon), independent local cinemas, and every multiplex located within malls. Do not omit any theaters in or near "${params.city}". Scan all ticketing platforms like Fandango, MovieTickets, and direct theater sites.`;
  } else if (params.theaterName) {
    prompt = `List ALL movies currently playing ${yearContext} at the venue/mall named "${params.theaterName}" located ${locationPart} today between ${params.startTime} and ${params.endTime}. It is crucial that the theater/mall is within or very near "${params.city}". Provide showtimes and ticket prices for every single movie found at this specific location.`;
  } else if (params.city) {
    prompt = `Provide a comprehensive and exhaustive list of movies playing in "${params.city}" ${yearContext} today between ${params.startTime} and ${params.endTime}. Search for major chains, independent theaters, and local cinema clubs. Include theater names and current ticket prices for the widest range of options.`;
  }

  prompt += ` Return a list of theaters/screenings with their addresses, specific showtimes, and the current ticket price in the local currency. 
  If multiple movies are playing at one location (like in a mall), include each movie as a separate entry. 
  The "name" field should be formatted as "Movie Title @ Theater/Mall Name".
  Only include results that are in the specified time range. Provide currency symbol (e.g., $, £, €, ₹).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theaters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Full identifier: 'Movie Title @ Theater Name'" },
                  address: { type: Type.STRING },
                  showtime: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  currencySymbol: { type: Type.STRING },
                  bookingUrl: { type: Type.STRING }
                },
                required: ["name", "address", "showtime", "price", "currencySymbol", "bookingUrl"]
              }
            }
          },
          required: ["theaters"]
        }
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON", jsonStr);
      throw new Error("Received invalid data from cinema search service.");
    }

    const rawResults: TheaterInfo[] = data.theaters || [];
    
    const results = rawResults
      .sort((a, b) => a.price - b.price)
      .map((item, index) => ({
        ...item,
        isCheapest: index === 0 && rawResults.length > 0
      }));

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { results, sources };
  } catch (error) {
    console.error("Error fetching cinema data:", error);
    throw error;
  }
};

/**
 * Fetches core movie data from TMDb (Synopses, Cast, Posters, and User Reviews)
 */
export const fetchTmdbMovieData = async (title: string) => {
  try {
    const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
    const searchData = await searchRes.json();
    
    if (!searchData.results || searchData.results.length === 0) return null;
    
    const movie = searchData.results[0];
    const movieId = movie.id;

    const [detailsRes, creditsRes, reviewsRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${TMDB_API_KEY}`)
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();
    const reviewsData = await reviewsRes.json();

    return {
      tmdbId: movieId,
      title: details.title,
      synopsis: details.overview,
      releaseDate: details.release_date,
      runtime: `${details.runtime} min`,
      posterPath: details.poster_path ? `https://image.tmdb.org/t/p/w780${details.poster_path}` : null,
      backdropPath: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
      cast: credits.cast.slice(0, 15).map((c: any) => ({
        name: c.name,
        role: c.character,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      })),
      userReviews: reviewsData.results.slice(0, 3).map((r: any) => ({
        author: r.author,
        content: r.content,
        rating: r.author_details?.rating ? `${r.author_details.rating}/10` : 'N/A',
        url: r.url
      })),
      genres: details.genres.map((g: any) => g.name),
      voteAverage: details.vote_average,
      tagline: details.tagline,
      budget: details.budget ? `$${details.budget.toLocaleString()}` : "N/A",
      revenue: details.revenue ? `$${details.revenue.toLocaleString()}` : "N/A"
    };
  } catch (error) {
    console.error("Error fetching TMDb data:", error);
    return null;
  }
};

/**
 * Hybrid function: Uses TMDb for facts/audience and Gemini for critical analysis/mood
 */
export const fetchMovieVaultData = async (movieTitle: string): Promise<any> => {
  const tmdbData = await fetchTmdbMovieData(movieTitle);
  if (!tmdbData) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform a deep critical sweep for "${tmdbData.title}" (${tmdbData.releaseDate}). 
  You are an elite cinematic aggregator in 2025. 
  1. Define 3 "Mood Tags" that perfectly capture the aesthetic.
  2. Find 3 high-authority critical reviews (Empire, Variety, Rolling Stone, or IGN).
  3. Extract a "Critical Consensus" sentence summarizing how critics feel.
  4. Suggest 4 similar movies with titles and release years.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moodTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            consensus: { type: Type.STRING },
            criticReviews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  author: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  score: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              }
            },
            similar: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  year: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const aiAnalysis = JSON.parse(response.text || "{}");

    return {
      movie: {
        Title: tmdbData.title,
        Year: tmdbData.releaseDate ? tmdbData.releaseDate.split('-')[0] : "N/A",
        Runtime: tmdbData.runtime,
        Plot: tmdbData.synopsis,
        Genre: tmdbData.genres.join(', '),
        Poster: tmdbData.posterPath,
        Backdrop: tmdbData.backdropPath,
        Actors: tmdbData.cast.map((c: any) => c.name).join(', '),
        FullCast: tmdbData.cast,
        BoxOffice: tmdbData.revenue,
        Tagline: tmdbData.tagline,
        MoodTags: aiAnalysis.moodTags || [],
        Consensus: aiAnalysis.consensus || "Critics are generally captivated by this production's vision.",
        imdbRating: tmdbData.voteAverage.toFixed(1),
        UserReviews: tmdbData.userReviews,
        Director: "Search Cast Credits",
        Production: "N/A"
      },
      reviews: aiAnalysis.criticReviews || [],
      similar: aiAnalysis.similar || []
    };
  } catch (error) {
    console.error("Error fetching hybrid movie data:", error);
    return {
      movie: {
        Title: tmdbData.title,
        Year: tmdbData.releaseDate ? tmdbData.releaseDate.split('-')[0] : "N/A",
        Runtime: tmdbData.runtime,
        Plot: tmdbData.synopsis,
        Genre: tmdbData.genres.join(', '),
        Poster: tmdbData.posterPath,
        Actors: tmdbData.cast.map((c: any) => c.name).join(', '),
        FullCast: tmdbData.cast,
        UserReviews: tmdbData.userReviews,
        MoodTags: [],
        imdbRating: tmdbData.voteAverage.toFixed(1)
      },
      reviews: [],
      similar: []
    };
  }
};

export const fetchTrendingMovies = async (city: string): Promise<TrendingMovie[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `List the top 5 trending movies in theaters in "${city}" for the current year 2025. 
  Provide: title, short genre, rating (e.g. 8.5/10), and a brief one-sentence description.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            movies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  rating: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "genre", "rating", "description"]
              }
            }
          },
          required: ["movies"]
        }
      },
    });

    const data = JSON.parse(response.text || "{}");
    return data.movies || [];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

export const fetchOmdbData = async (movieTitle: string): Promise<OmdbData | null> => {
  try {
    const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    if (data.Response === 'True') {
      return data as OmdbData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching OMDb data:", error);
    return null;
  }
};

export const fetchMovieSuggestions = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    if (data.Response === 'True' && data.Search) {
      return data.Search.sort((a: any, b: any) => {
        const aDist = Math.abs(a.Title.length - query.length);
        const bDist = Math.abs(b.Title.length - query.length);
        return aDist - bDist;
      }).slice(0, 6); 
    }
    return [];
  } catch (error) {
    console.error("Error fetching movie suggestions:", error);
    return [];
  }
};
