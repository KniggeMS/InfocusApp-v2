import { z } from 'zod';

/**
 * Import/Export Schema Definitions
 *
 * This module provides the shared data contract for importing and exporting
 * watchlist data across the InFocus platform (API, web, and mobile apps).
 *
 * The schemas support:
 * - CSV-style raw watchlist rows with minimal validation
 * - Normalized preview items with TMDB match candidates
 * - Duplicate resolution strategies (skip, overwrite, merge)
 *
 * @example
 * ```typescript
 * // Parse a raw CSV row
 * const rawRow = rawWatchlistRowSchema.parse({
 *   title: "Inception",
 *   year: 2010,
 *   status: "completed",
 *   rating: 9,
 *   notes: "Amazing movie!",
 *   dateAdded: "2024-01-15",
 *   streamingProviders: ["netflix", "hulu"]
 * });
 *
 * // Create a preview item with TMDB matches
 * const preview = normalizedPreviewItemSchema.parse({
 *   originalTitle: "Inception",
 *   originalYear: 2010,
 *   matchCandidates: [
 *     {
 *       tmdbId: 27205,
 *       tmdbType: "movie",
 *       title: "Inception",
 *       year: 2010,
 *       posterPath: "/path/to/poster.jpg",
 *       confidence: 0.98
 *     }
 *   ],
 *   suggestedStatus: "completed",
 *   rating: 9,
 *   notes: "Amazing movie!"
 * });
 * ```
 */

// ============================================================================
// Raw Watchlist Row Schema
// ============================================================================

/**
 * Schema for raw watchlist rows from CSV/Excel imports.
 * Designed to be flexible for user-provided data with minimal validation.
 */
export const rawWatchlistRowSchema = z.object({
  /** The title of the media item (required) */
  title: z.string().min(1).max(500).trim(),

  /** Optional release year for better TMDB matching */
  year: z.number().int().min(1800).max(2100).optional().nullable(),

  /** Watch status - flexible strings that will be normalized */
  status: z.string().default('not_watched'),

  /** User rating on a 0-10 scale */
  rating: z.number().int().min(0).max(10).optional().nullable(),

  /** User's personal notes about the item */
  notes: z.string().max(2000).optional().nullable(),

  /** Date when the item was added to the watchlist */
  dateAdded: z.string().datetime({ offset: true }).or(z.string().date()).optional().nullable(),

  /** Array of streaming provider identifiers */
  streamingProviders: z.array(z.string().trim()).default([]),
});

export type RawWatchlistRow = z.infer<typeof rawWatchlistRowSchema>;

// ============================================================================
// TMDB Match Candidate Schema
// ============================================================================

/**
 * Schema for TMDB search match candidates with confidence scoring.
 * Used to present users with potential matches for their imported items.
 */
export const tmdbMatchCandidateSchema = z.object({
  /** TMDB identifier for the media item */
  tmdbId: z.number().int().positive(),

  /** Type of media: 'movie' or 'tv' */
  tmdbType: z.enum(['movie', 'tv']),

  /** Title from TMDB */
  title: z.string(),

  /** Release year from TMDB */
  year: z.number().int().optional().nullable(),

  /** Poster image path from TMDB */
  posterPath: z.string().nullable(),

  /** Backdrop image path from TMDB */
  backdropPath: z.string().nullable().optional(),

  /** Overview/description from TMDB */
  overview: z.string().nullable().optional(),

  /**
   * Confidence score (0-1) indicating how likely this is the correct match.
   * Based on title similarity, year match, and other factors.
   */
  confidence: z.number().min(0).max(1),
});

export type TmdbMatchCandidate = z.infer<typeof tmdbMatchCandidateSchema>;

// ============================================================================
// Normalized Preview Item Schema
// ============================================================================

/**
 * Schema for normalized preview items with TMDB match candidates.
 * Represents an imported row after initial processing and TMDB search.
 */
export const normalizedPreviewItemSchema = z.object({
  /** The original title from the import */
  originalTitle: z.string(),

  /** The original year from the import (if provided) */
  originalYear: z.number().int().optional().nullable(),

  /** List of potential TMDB matches, ordered by confidence score (descending) */
  matchCandidates: z.array(tmdbMatchCandidateSchema).default([]),

  /** The user's selected match (if they've made a choice) */
  selectedMatchIndex: z.number().int().min(0).optional().nullable(),

  /** Normalized watch status */
  suggestedStatus: z.enum(['not_watched', 'watching', 'completed']).default('not_watched'),

  /** User rating (0-10) */
  rating: z.number().int().min(0).max(10).optional().nullable(),

  /** User notes */
  notes: z.string().max(2000).optional().nullable(),

  /** Date added */
  dateAdded: z.string().datetime({ offset: true }).optional().nullable(),

  /** Streaming providers */
  streamingProviders: z.array(z.string()).default([]),

  /** Whether this item has an existing entry in the user's watchlist (duplicate) */
  hasExistingEntry: z.boolean().default(false),

  /** The existing entry ID if duplicate */
  existingEntryId: z.string().cuid().optional().nullable(),

  /** Whether this item should be skipped (user decision or error) */
  shouldSkip: z.boolean().default(false),

  /** Error message if item couldn't be processed */
  error: z.string().optional().nullable(),
});

export type NormalizedPreviewItem = z.infer<typeof normalizedPreviewItemSchema>;

// ============================================================================
// Duplicate Resolution Strategies
// ============================================================================

/**
 * Enum for duplicate resolution strategies.
 */
export const duplicateResolutionStrategySchema = z.enum([
  /** Skip the imported item, keep existing entry unchanged */
  'skip',

  /** Replace the existing entry completely with imported data */
  'overwrite',

  /** Merge imported data with existing entry using specified rules */
  'merge',
]);

export type DuplicateResolutionStrategy = z.infer<typeof duplicateResolutionStrategySchema>;

/**
 * Schema for merge payload fields.
 * Specifies which fields to update when merging duplicate entries.
 */
export const mergeFieldsSchema = z.object({
  /** Update the watch status */
  status: z.boolean().default(false),

  /** Update the rating */
  rating: z.boolean().default(false),

  /** Append or replace notes */
  notes: z.enum(['append', 'replace', 'keep']).default('keep'),

  /** Update streaming providers */
  streamingProviders: z.enum(['merge', 'replace', 'keep']).default('keep'),
});

export type MergeFields = z.infer<typeof mergeFieldsSchema>;

/**
 * Schema for duplicate resolution instructions.
 * Tells the API how to handle a specific duplicate entry.
 */
export const duplicateResolutionSchema = z.object({
  /** The preview item ID or index being resolved */
  itemIndex: z.number().int().min(0),

  /** The resolution strategy to use */
  strategy: duplicateResolutionStrategySchema,

  /** Merge instructions (only used when strategy is 'merge') */
  mergeFields: mergeFieldsSchema.optional(),
});

export type DuplicateResolution = z.infer<typeof duplicateResolutionSchema>;

// ============================================================================
// Bulk Import Request Schema
// ============================================================================

/**
 * Schema for a bulk import request.
 * Contains the preview items and resolution instructions.
 */
export const bulkImportRequestSchema = z.object({
  /** List of preview items to import */
  items: z.array(normalizedPreviewItemSchema),

  /** List of duplicate resolution instructions */
  resolutions: z.array(duplicateResolutionSchema).default([]),

  /** Whether to skip items that couldn't be matched to TMDB */
  skipUnmatched: z.boolean().default(false),

  /** Default resolution strategy for duplicates not explicitly resolved */
  defaultDuplicateStrategy: duplicateResolutionStrategySchema.default('skip'),
});

export type BulkImportRequest = z.infer<typeof bulkImportRequestSchema>;

// ============================================================================
// Import Result Schema
// ============================================================================

/**
 * Schema for the result of a bulk import operation.
 */
export const importResultSchema = z.object({
  /** Number of items successfully imported */
  imported: z.number().int().min(0),

  /** Number of items skipped */
  skipped: z.number().int().min(0),

  /** Number of items that failed to import */
  failed: z.number().int().min(0),

  /** Number of duplicates that were merged */
  merged: z.number().int().min(0),

  /** Number of duplicates that were overwritten */
  overwritten: z.number().int().min(0),

  /** List of error messages for failed items */
  errors: z
    .array(
      z.object({
        itemIndex: z.number().int(),
        title: z.string(),
        error: z.string(),
      }),
    )
    .default([]),
});

export type ImportResult = z.infer<typeof importResultSchema>;

// ============================================================================
// Export Format Schema
// ============================================================================

/**
 * Schema for exported watchlist data.
 * Designed to be easily re-imported.
 */
export const exportedWatchlistEntrySchema = z.object({
  /** Title of the media item */
  title: z.string(),

  /** Release year */
  year: z.number().int().optional().nullable(),

  /** Media type */
  type: z.enum(['movie', 'tv']),

  /** Watch status */
  status: z.enum(['not_watched', 'watching', 'completed']),

  /** User rating (0-10) */
  rating: z.number().int().min(0).max(10).optional().nullable(),

  /** User notes */
  notes: z.string().optional().nullable(),

  /** Date added to watchlist */
  dateAdded: z.string().datetime({ offset: true }),

  /** Date watched/completed */
  dateWatched: z.string().datetime({ offset: true }).optional().nullable(),

  /** Streaming providers */
  streamingProviders: z.array(z.string()).default([]),

  /** TMDB ID for re-import matching */
  tmdbId: z.number().int().positive().optional(),

  /** Poster path from TMDB */
  posterPath: z.string().nullable().optional(),
});

export type ExportedWatchlistEntry = z.infer<typeof exportedWatchlistEntrySchema>;

/**
 * Schema for the complete export response.
 */
export const exportResponseSchema = z.object({
  /** Export timestamp */
  exportedAt: z.string().datetime({ offset: true }),

  /** User ID who exported the data */
  userId: z.string().cuid(),

  /** Export format version for future compatibility */
  version: z.string().default('1.0'),

  /** Total number of entries */
  totalEntries: z.number().int().min(0),

  /** The exported watchlist entries */
  entries: z.array(exportedWatchlistEntrySchema),
});

export type ExportResponse = z.infer<typeof exportResponseSchema>;
