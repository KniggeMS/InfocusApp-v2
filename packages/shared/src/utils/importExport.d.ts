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
export declare function normalizeWatchStatus(status: string | null | undefined): WatchStatus | null;
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
export declare function parseStreamingProviders(providers: string | string[] | null | undefined): string[];
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
export declare function normalizeDateString(dateStr: string | number | Date | null | undefined): string | null;
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
export declare function calculateMatchConfidence(candidateTitle: string, candidateYear: number | null | undefined, originalTitle: string, originalYear: number | null | undefined, hasPoster?: boolean): number;
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
export declare function normalizeRating(rating: number | null | undefined, scale?: 5 | 10 | 100): number | null;
//# sourceMappingURL=importExport.d.ts.map