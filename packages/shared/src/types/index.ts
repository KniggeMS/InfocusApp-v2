export type MediaType = 'movie' | 'tv';

export type WatchStatus = 'not_watched' | 'watching' | 'completed';

export type FamilyRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  id: string;
  tmdbId: number;
  type: MediaType;
  title: string;
  overview: string | null;
  releaseDate: Date | null;
  posterPath: string | null;
  backdropPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  mediaItemId: string;
  status: WatchStatus;
  rating: number | null;
  notes: string | null;
  watchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
