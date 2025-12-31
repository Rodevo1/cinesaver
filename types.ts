
export interface TheaterInfo {
  name: string;
  address: string;
  showtime: string;
  price: number;
  currencySymbol: string;
  bookingUrl: string;
  isCheapest?: boolean;
}

export interface TrendingMovie {
  title: string;
  genre: string;
  rating: string;
  description: string;
}

export interface CriticalReview {
  source: string;
  author: string;
  summary: string;
  score: string;
  url: string;
}

export interface SimilarMovie {
  title: string;
  year: string;
  poster: string;
}

export interface MovieSuggestion {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbData {
  Title: string;
  Plot: string;
  Ratings: Array<{ Source: string; Value: string }>;
  imdbRating: string;
  Metascore: string;
  Year: string;
  Rated: string;
  Director: string;
  Actors: string;
  Poster: string;
  Genre: string;
  Runtime: string;
  Released: string;
  BoxOffice: string;
  Awards: string;
  Production: string;
  Writer: string;
}

export interface SearchParams {
  movieName: string;
  theaterName?: string;
  city: string;
  startTime: string;
  endTime: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
