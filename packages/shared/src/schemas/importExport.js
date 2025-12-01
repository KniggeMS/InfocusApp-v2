"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportResponseSchema = exports.exportedWatchlistEntrySchema = exports.importResultSchema = exports.bulkImportRequestSchema = exports.duplicateResolutionSchema = exports.mergeFieldsSchema = exports.duplicateResolutionStrategySchema = exports.normalizedPreviewItemSchema = exports.tmdbMatchCandidateSchema = exports.rawWatchlistRowSchema = void 0;
const zod_1 = require("zod");
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
exports.rawWatchlistRowSchema = zod_1.z.object({
    /** The title of the media item (required) */
    title: zod_1.z.string().min(1).max(500).trim(),
    /** Optional release year for better TMDB matching */
    year: zod_1.z.number().int().min(1800).max(2100).optional().nullable(),
    /** Watch status - flexible strings that will be normalized */
    status: zod_1.z.string().default('not_watched'),
    /** User rating on a 0-10 scale */
    rating: zod_1.z.number().int().min(0).max(10).optional().nullable(),
    /** User's personal notes about the item */
    notes: zod_1.z.string().max(2000).optional().nullable(),
    /** Date when the item was added to the watchlist */
    dateAdded: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().date()).optional().nullable(),
    /** Array of streaming provider identifiers */
    streamingProviders: zod_1.z.array(zod_1.z.string().trim()).default([]),
});
// ============================================================================
// TMDB Match Candidate Schema
// ============================================================================
/**
 * Schema for TMDB search match candidates with confidence scoring.
 * Used to present users with potential matches for their imported items.
 */
exports.tmdbMatchCandidateSchema = zod_1.z.object({
    /** TMDB identifier for the media item */
    tmdbId: zod_1.z.number().int().positive(),
    /** Type of media: 'movie' or 'tv' */
    tmdbType: zod_1.z.enum(['movie', 'tv']),
    /** Title from TMDB */
    title: zod_1.z.string(),
    /** Release year from TMDB */
    year: zod_1.z.number().int().optional().nullable(),
    /** Poster image path from TMDB */
    posterPath: zod_1.z.string().nullable(),
    /** Backdrop image path from TMDB */
    backdropPath: zod_1.z.string().nullable().optional(),
    /** Overview/description from TMDB */
    overview: zod_1.z.string().nullable().optional(),
    /**
     * Confidence score (0-1) indicating how likely this is the correct match.
     * Based on title similarity, year match, and other factors.
     */
    confidence: zod_1.z.number().min(0).max(1),
});
// ============================================================================
// Normalized Preview Item Schema
// ============================================================================
/**
 * Schema for normalized preview items with TMDB match candidates.
 * Represents an imported row after initial processing and TMDB search.
 */
exports.normalizedPreviewItemSchema = zod_1.z.object({
    /** The original title from the import */
    originalTitle: zod_1.z.string(),
    /** The original year from the import (if provided) */
    originalYear: zod_1.z.number().int().optional().nullable(),
    /** List of potential TMDB matches, ordered by confidence score (descending) */
    matchCandidates: zod_1.z.array(exports.tmdbMatchCandidateSchema).default([]),
    /** The user's selected match (if they've made a choice) */
    selectedMatchIndex: zod_1.z.number().int().min(0).optional().nullable(),
    /** Normalized watch status */
    suggestedStatus: zod_1.z.enum(['not_watched', 'watching', 'completed']).default('not_watched'),
    /** User rating (0-10) */
    rating: zod_1.z.number().int().min(0).max(10).optional().nullable(),
    /** User notes */
    notes: zod_1.z.string().max(2000).optional().nullable(),
    /** Date added */
    dateAdded: zod_1.z.string().datetime({ offset: true }).optional().nullable(),
    /** Streaming providers */
    streamingProviders: zod_1.z.array(zod_1.z.string()).default([]),
    /** Whether this item has an existing entry in the user's watchlist (duplicate) */
    hasExistingEntry: zod_1.z.boolean().default(false),
    /** The existing entry ID if duplicate */
    existingEntryId: zod_1.z.string().cuid().optional().nullable(),
    /** Whether this item should be skipped (user decision or error) */
    shouldSkip: zod_1.z.boolean().default(false),
    /** Error message if item couldn't be processed */
    error: zod_1.z.string().optional().nullable(),
});
// ============================================================================
// Duplicate Resolution Strategies
// ============================================================================
/**
 * Enum for duplicate resolution strategies.
 */
exports.duplicateResolutionStrategySchema = zod_1.z.enum([
    /** Skip the imported item, keep existing entry unchanged */
    'skip',
    /** Replace the existing entry completely with imported data */
    'overwrite',
    /** Merge imported data with existing entry using specified rules */
    'merge',
]);
/**
 * Schema for merge payload fields.
 * Specifies which fields to update when merging duplicate entries.
 */
exports.mergeFieldsSchema = zod_1.z.object({
    /** Update the watch status */
    status: zod_1.z.boolean().default(false),
    /** Update the rating */
    rating: zod_1.z.boolean().default(false),
    /** Append or replace notes */
    notes: zod_1.z.enum(['append', 'replace', 'keep']).default('keep'),
    /** Update streaming providers */
    streamingProviders: zod_1.z.enum(['merge', 'replace', 'keep']).default('keep'),
});
/**
 * Schema for duplicate resolution instructions.
 * Tells the API how to handle a specific duplicate entry.
 */
exports.duplicateResolutionSchema = zod_1.z.object({
    /** The preview item ID or index being resolved */
    itemIndex: zod_1.z.number().int().min(0),
    /** The resolution strategy to use */
    strategy: exports.duplicateResolutionStrategySchema,
    /** Merge instructions (only used when strategy is 'merge') */
    mergeFields: exports.mergeFieldsSchema.optional(),
});
// ============================================================================
// Bulk Import Request Schema
// ============================================================================
/**
 * Schema for a bulk import request.
 * Contains the preview items and resolution instructions.
 */
exports.bulkImportRequestSchema = zod_1.z.object({
    /** List of preview items to import */
    items: zod_1.z.array(exports.normalizedPreviewItemSchema),
    /** List of duplicate resolution instructions */
    resolutions: zod_1.z.array(exports.duplicateResolutionSchema).default([]),
    /** Whether to skip items that couldn't be matched to TMDB */
    skipUnmatched: zod_1.z.boolean().default(false),
    /** Default resolution strategy for duplicates not explicitly resolved */
    defaultDuplicateStrategy: exports.duplicateResolutionStrategySchema.default('skip'),
});
// ============================================================================
// Import Result Schema
// ============================================================================
/**
 * Schema for the result of a bulk import operation.
 */
exports.importResultSchema = zod_1.z.object({
    /** Number of items successfully imported */
    imported: zod_1.z.number().int().min(0),
    /** Number of items skipped */
    skipped: zod_1.z.number().int().min(0),
    /** Number of items that failed to import */
    failed: zod_1.z.number().int().min(0),
    /** Number of duplicates that were merged */
    merged: zod_1.z.number().int().min(0),
    /** Number of duplicates that were overwritten */
    overwritten: zod_1.z.number().int().min(0),
    /** List of error messages for failed items */
    errors: zod_1.z
        .array(zod_1.z.object({
        itemIndex: zod_1.z.number().int(),
        title: zod_1.z.string(),
        error: zod_1.z.string(),
    }))
        .default([]),
});
// ============================================================================
// Export Format Schema
// ============================================================================
/**
 * Schema for exported watchlist data.
 * Designed to be easily re-imported.
 */
exports.exportedWatchlistEntrySchema = zod_1.z.object({
    /** Title of the media item */
    title: zod_1.z.string(),
    /** Release year */
    year: zod_1.z.number().int().optional().nullable(),
    /** Media type */
    type: zod_1.z.enum(['movie', 'tv']),
    /** Watch status */
    status: zod_1.z.enum(['not_watched', 'watching', 'completed']),
    /** User rating (0-10) */
    rating: zod_1.z.number().int().min(0).max(10).optional().nullable(),
    /** User notes */
    notes: zod_1.z.string().optional().nullable(),
    /** Date added to watchlist */
    dateAdded: zod_1.z.string().datetime({ offset: true }),
    /** Date watched/completed */
    dateWatched: zod_1.z.string().datetime({ offset: true }).optional().nullable(),
    /** Streaming providers */
    streamingProviders: zod_1.z.array(zod_1.z.string()).default([]),
    /** TMDB ID for re-import matching */
    tmdbId: zod_1.z.number().int().positive().optional(),
    /** Poster path from TMDB */
    posterPath: zod_1.z.string().nullable().optional(),
});
/**
 * Schema for the complete export response.
 */
exports.exportResponseSchema = zod_1.z.object({
    /** Export timestamp */
    exportedAt: zod_1.z.string().datetime({ offset: true }),
    /** User ID who exported the data */
    userId: zod_1.z.string().cuid(),
    /** Export format version for future compatibility */
    version: zod_1.z.string().default('1.0'),
    /** Total number of entries */
    totalEntries: zod_1.z.number().int().min(0),
    /** The exported watchlist entries */
    entries: zod_1.z.array(exports.exportedWatchlistEntrySchema),
});
//# sourceMappingURL=importExport.js.map