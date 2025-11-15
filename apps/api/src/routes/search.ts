import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv' | 'person';
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface SearchResponse {
  id: number;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate?: string;
  voteAverage: number;
  genres: number[];
}

// GET /search - Search for movies and TV shows
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
          error: 'Query parameter is required and must be a non-empty string',
        });
        return;
      }

      if (!TMDB_API_KEY) {
        res.status(500).json({
          error: 'TMDB API key is not configured',
        });
        return;
      }

      // Build TMDB API URL
      const url = new URL(`${TMDB_BASE_URL}/search/multi`);
      url.searchParams.append('api_key', TMDB_API_KEY);
      url.searchParams.append('query', query.trim());
      url.searchParams.append('page', '1');

      // Search TMDB for both movies and TV shows
      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 404) {
          res.status(404).json({
            error: 'Search service not available',
          });
          return;
        }
        if (response.status === 401 || response.status === 429) {
          res.status(503).json({
            error: 'Search service temporarily unavailable',
          });
          return;
        }
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();

      // Filter and transform results to only include movies and TV shows
      const results: SearchResponse[] = data.results
        .filter((result: TMDBSearchResult) => result.media_type !== 'person' && result.poster_path)
        .map((result: TMDBSearchResult) => ({
          id: result.id,
          title: result.title || result.name || 'Unknown',
          mediaType: result.media_type === 'tv' ? 'tv' : 'movie',
          posterPath: result.poster_path,
          backdropPath: result.backdrop_path,
          overview: result.overview,
          releaseDate: result.release_date || result.first_air_date,
          voteAverage: result.vote_average,
          genres: result.genre_ids || [],
        }))
        .slice(0, 20); // Limit to 20 results

      res.json({
        data: results,
        count: results.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as searchRouter };
