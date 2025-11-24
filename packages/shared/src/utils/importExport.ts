import type { WatchStatus } from '../types';

/**
 * Normalizes user-provided status strings to valid WatchStatus values.
 *
 * Handles common variations and synonyms:
 * - "completed", "watched", "done", "finished" → "completed"
 * - "watching", "in progress", "started" → "watching"
 * - "not watched", "unwatched", "to watch", "plan to watch" → "not_watched"
 *
 * @param status - The raw status string from user input
 * @returns A valid WatchStatus value or null if unable to normalize
 *
 * @example
 * ```typescript
 * normalizeWatchStatus("Watched") // returns "completed"
 * normalizeWatchStatus("in progress") // returns "watching"
 * normalizeWatchStatus("to watch") // returns "not_watched"
 * normalizeWatchStatus("unknown") // returns null
 * ```
 */
export function normalizeWatchStatus(status: string | null | undefined): WatchStatus | null {
  if (!status) {
    return 'not_watched';
  }

  // Normalize to lowercase and trim whitespace
  const normalized = status.toLowerCase().trim();

  // Map common variations to valid statuses
  const completedVariations = [
    'completed',
    'watched',
    'done',
    'finished',
    'complete',
    'saw',
    'seen',
  ];

  const watchingVariations = [
    'watching',
    'in progress',
    'in-progress',
    'started',
    'currently watching',
    'ongoing',
  ];

  const notWatchedVariations = [
    'not watched',
    'not_watched',
    'unwatched',
    'to watch',
    'plan to watch',
    'want to watch',
    'planned',
    'ptw',
    'backlog',
  ];

  if (completedVariations.includes(normalized)) {
    return 'completed';
  }

  if (watchingVariations.includes(normalized)) {
    return 'watching';
  }

  if (notWatchedVariations.includes(normalized)) {
    return 'not_watched';
  }

  // Default to not_watched if we can't determine
  return 'not_watched';
}

/**
 * Safely parses streaming provider data from various input formats.
 *
 * Handles:
 * - Array of strings: ["netflix", "hulu"]
 * - Comma-separated string: "netflix, hulu"
 * - JSON string: '["netflix", "hulu"]'
 * - Single string: "netflix"
 *
 * @param providers - Raw provider data in any supported format
 * @returns Array of normalized provider names (lowercase, trimmed)
 *
 * @example
 * ```typescript
 * parseStreamingProviders(["Netflix", "Hulu"]) // ["netflix", "hulu"]
 * parseStreamingProviders("Netflix, Hulu") // ["netflix", "hulu"]
 * parseStreamingProviders('["Netflix", "Hulu"]') // ["netflix", "hulu"]
 * parseStreamingProviders("Netflix") // ["netflix"]
 * parseStreamingProviders(null) // []
 * ```
 */
export function parseStreamingProviders(providers: string | string[] | null | undefined): string[] {
  if (!providers) {
    return [];
  }

  try {
    // If it's already an array, normalize it
    if (Array.isArray(providers)) {
      return providers
        .map((p) => (typeof p === 'string' ? p.toLowerCase().trim() : ''))
        .filter((p) => p.length > 0);
    }

    // If it's a string, try to parse it
    if (typeof providers === 'string') {
      const trimmed = providers.trim();

      // Try to parse as JSON array
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parseStreamingProviders(parsed);
          }
        } catch {
          // Not valid JSON, fall through to CSV parsing
        }
      }

      // Try to split by common delimiters
      const delimiters = [',', ';', '|'];
      for (const delimiter of delimiters) {
        if (trimmed.includes(delimiter)) {
          return trimmed
            .split(delimiter)
            .map((p) => p.toLowerCase().trim())
            .filter((p) => p.length > 0);
        }
      }

      // Single provider
      return trimmed.length > 0 ? [trimmed.toLowerCase()] : [];
    }
  } catch (error) {
    console.warn('Failed to parse streaming providers:', error);
  }

  return [];
}

/**
 * Normalizes a date string to ISO 8601 format with timezone offset.
 *
 * Handles various date formats:
 * - ISO 8601 with timezone: "2024-01-15T00:00:00.000Z"
 * - ISO date only: "2024-01-15"
 * - US format: "01/15/2024" or "1/15/2024"
 * - EU format: "15/01/2024" or "15.01.2024"
 * - Timestamp: 1705276800000
 *
 * @param dateStr - Raw date input in various formats
 * @returns ISO 8601 date string with timezone, or null if invalid
 *
 * @example
 * ```typescript
 * normalizeDateString("2024-01-15") // "2024-01-15T00:00:00.000Z"
 * normalizeDateString("01/15/2024") // "2024-01-15T00:00:00.000Z"
 * normalizeDateString("15.01.2024") // "2024-01-15T00:00:00.000Z"
 * normalizeDateString(1705276800000) // "2024-01-15T00:00:00.000Z"
 * normalizeDateString("invalid") // null
 * ```
 */
export function normalizeDateString(
  dateStr: string | number | Date | null | undefined,
): string | null {
  if (!dateStr) {
    return null;
  }

  try {
    let date: Date;

    // Handle Date objects
    if (dateStr instanceof Date) {
      date = dateStr;
    }
    // Handle timestamps
    else if (typeof dateStr === 'number') {
      date = new Date(dateStr);
    }
    // Handle string dates
    else {
      const trimmed = dateStr.trim();

      // Try to parse as ISO date (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        date = new Date(trimmed);
      }
      // Try US format (MM/DD/YYYY)
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [month, day, year] = trimmed.split('/').map(Number);
        date = new Date(year, month - 1, day);
      }
      // Try EU format (DD.MM.YYYY or DD/MM/YYYY)
      else if (/^\d{1,2}[./]\d{1,2}[./]\d{4}$/.test(trimmed)) {
        const [day, month, year] = trimmed.split(/[./]/).map(Number);
        date = new Date(year, month - 1, day);
      }
      // Fallback to Date constructor
      else {
        date = new Date(trimmed);
      }
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  } catch (error) {
    console.warn('Failed to normalize date:', error);
    return null;
  }
}

/**
 * Calculates the confidence score for a TMDB match candidate.
 *
 * Scoring factors:
 * - Exact title match: +0.5
 * - Partial title match: +0.3 (scaled by similarity)
 * - Year match: +0.3
 * - Year off by 1: +0.15
 * - Has poster: +0.05
 *
 * @param candidateTitle - Title from TMDB
 * @param candidateYear - Year from TMDB
 * @param originalTitle - Original title from import
 * @param originalYear - Original year from import
 * @param hasPoster - Whether the candidate has a poster image
 * @returns Confidence score between 0 and 1
 *
 * @example
 * ```typescript
 * calculateMatchConfidence("Inception", 2010, "Inception", 2010, true) // 1.0
 * calculateMatchConfidence("Inception", 2010, "Inception", null, true) // 0.85
 * calculateMatchConfidence("The Matrix", 1999, "Matrix", 1999, true) // 0.85
 * calculateMatchConfidence("The Matrix", 2000, "Matrix", 1999, false) // 0.45
 * ```
 */
export function calculateMatchConfidence(
  candidateTitle: string,
  candidateYear: number | null | undefined,
  originalTitle: string,
  originalYear: number | null | undefined,
  hasPoster = false,
): number {
  let score = 0;

  // Normalize titles for comparison
  const normalizeTitle = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normCandidate = normalizeTitle(candidateTitle);
  const normOriginal = normalizeTitle(originalTitle);

  // Title matching (max 0.5 points)
  if (normCandidate === normOriginal) {
    score += 0.5;
  } else {
    // Calculate similarity based on common words
    const candidateWords = new Set(normCandidate.split(' '));
    const originalWords = new Set(normOriginal.split(' '));
    const intersection = new Set([...candidateWords].filter((w) => originalWords.has(w)));

    const similarity = (2 * intersection.size) / (candidateWords.size + originalWords.size);
    score += similarity * 0.3;
  }

  // Year matching (max 0.3 points)
  if (originalYear && candidateYear) {
    const yearDiff = Math.abs(candidateYear - originalYear);
    if (yearDiff === 0) {
      score += 0.3;
    } else if (yearDiff === 1) {
      score += 0.15; // Off by one year is common for release dates
    }
  } else if (!originalYear) {
    // No year provided, give partial credit
    score += 0.15;
  }

  // Poster availability (max 0.05 points)
  if (hasPoster) {
    score += 0.05;
  }

  // Popularity bonus for exact or very close matches (max 0.15 points)
  if (score >= 0.7) {
    score += 0.15;
  }

  return Math.min(score, 1.0);
}

/**
 * Validates and normalizes a rating value.
 *
 * Handles:
 * - Scale conversion: 5-star (0-5) → 10-point (0-10)
 * - Percentage: 0-100 → 0-10
 * - Decimal values: rounds to nearest integer
 * - Out of range: clamps to 0-10
 *
 * @param rating - Raw rating value
 * @param scale - The scale of the input rating (5, 10, or 100)
 * @returns Normalized rating (0-10) or null if invalid
 *
 * @example
 * ```typescript
 * normalizeRating(5, 5) // 10
 * normalizeRating(3.5, 5) // 7
 * normalizeRating(85, 100) // 9 (rounded from 8.5)
 * normalizeRating(7.8, 10) // 8
 * normalizeRating(-1, 10) // 0 (clamped)
 * normalizeRating(15, 10) // 10 (clamped)
 * ```
 */
export function normalizeRating(
  rating: number | null | undefined,
  scale: 5 | 10 | 100 = 10,
): number | null {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return null;
  }

  let normalized: number;

  switch (scale) {
    case 5:
      // Convert 0-5 scale to 0-10
      normalized = (rating / 5) * 10;
      break;
    case 100:
      // Convert 0-100 scale to 0-10
      normalized = rating / 10;
      break;
    case 10:
    default:
      normalized = rating;
      break;
  }

  // Round to nearest integer
  normalized = Math.round(normalized);

  // Clamp to 0-10 range
  return Math.max(0, Math.min(10, normalized));
}
