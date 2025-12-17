export enum Category {
  BOOK = 'Book',
  MOVIE = 'Movie',
  TV_SERIES = 'TV Series',
  MUSIC = 'Music',
}

export interface FavoriteItem {
  id: string;
  category: Category;
  title: string;
  details?: string; // Author, Artist, or Genre
}

export interface Recommendation {
  category: string;
  title: string;
  creator?: string; // Author for books, Artist for music
  reason: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
}