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
/**
 * Schema for raw watchlist rows from CSV/Excel imports.
 * Designed to be flexible for user-provided data with minimal validation.
 */
export declare const rawWatchlistRowSchema: z.ZodObject<{
    /** The title of the media item (required) */
    title: z.ZodString;
    /** Optional release year for better TMDB matching */
    year: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** Watch status - flexible strings that will be normalized */
    status: z.ZodDefault<z.ZodString>;
    /** User rating on a 0-10 scale */
    rating: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** User's personal notes about the item */
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    /** Date when the item was added to the watchlist */
    dateAdded: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>>;
    /** Array of streaming provider identifiers */
    streamingProviders: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    status: string;
    streamingProviders: string[];
    year?: number | null | undefined;
    rating?: number | null | undefined;
    notes?: string | null | undefined;
    dateAdded?: string | null | undefined;
}, {
    title: string;
    year?: number | null | undefined;
    status?: string | undefined;
    rating?: number | null | undefined;
    notes?: string | null | undefined;
    dateAdded?: string | null | undefined;
    streamingProviders?: string[] | undefined;
}>;
export type RawWatchlistRow = z.infer<typeof rawWatchlistRowSchema>;
/**
 * Schema for TMDB search match candidates with confidence scoring.
 * Used to present users with potential matches for their imported items.
 */
export declare const tmdbMatchCandidateSchema: z.ZodObject<{
    /** TMDB identifier for the media item */
    tmdbId: z.ZodNumber;
    /** Type of media: 'movie' or 'tv' */
    tmdbType: z.ZodEnum<["movie", "tv"]>;
    /** Title from TMDB */
    title: z.ZodString;
    /** Release year from TMDB */
    year: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** Poster image path from TMDB */
    posterPath: z.ZodNullable<z.ZodString>;
    /** Backdrop image path from TMDB */
    backdropPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Overview/description from TMDB */
    overview: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * Confidence score (0-1) indicating how likely this is the correct match.
     * Based on title similarity, year match, and other factors.
     */
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    title: string;
    tmdbId: number;
    tmdbType: "movie" | "tv";
    posterPath: string | null;
    confidence: number;
    year?: number | null | undefined;
    backdropPath?: string | null | undefined;
    overview?: string | null | undefined;
}, {
    title: string;
    tmdbId: number;
    tmdbType: "movie" | "tv";
    posterPath: string | null;
    confidence: number;
    year?: number | null | undefined;
    backdropPath?: string | null | undefined;
    overview?: string | null | undefined;
}>;
export type TmdbMatchCandidate = z.infer<typeof tmdbMatchCandidateSchema>;
/**
 * Schema for normalized preview items with TMDB match candidates.
 * Represents an imported row after initial processing and TMDB search.
 */
export declare const normalizedPreviewItemSchema: z.ZodObject<{
    /** The original title from the import */
    originalTitle: z.ZodString;
    /** The original year from the import (if provided) */
    originalYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** List of potential TMDB matches, ordered by confidence score (descending) */
    matchCandidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** TMDB identifier for the media item */
        tmdbId: z.ZodNumber;
        /** Type of media: 'movie' or 'tv' */
        tmdbType: z.ZodEnum<["movie", "tv"]>;
        /** Title from TMDB */
        title: z.ZodString;
        /** Release year from TMDB */
        year: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        /** Poster image path from TMDB */
        posterPath: z.ZodNullable<z.ZodString>;
        /** Backdrop image path from TMDB */
        backdropPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Overview/description from TMDB */
        overview: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /**
         * Confidence score (0-1) indicating how likely this is the correct match.
         * Based on title similarity, year match, and other factors.
         */
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        title: string;
        tmdbId: number;
        tmdbType: "movie" | "tv";
        posterPath: string | null;
        confidence: number;
        year?: number | null | undefined;
        backdropPath?: string | null | undefined;
        overview?: string | null | undefined;
    }, {
        title: string;
        tmdbId: number;
        tmdbType: "movie" | "tv";
        posterPath: string | null;
        confidence: number;
        year?: number | null | undefined;
        backdropPath?: string | null | undefined;
        overview?: string | null | undefined;
    }>, "many">>;
    /** The user's selected match (if they've made a choice) */
    selectedMatchIndex: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** Normalized watch status */
    suggestedStatus: z.ZodDefault<z.ZodEnum<["not_watched", "watching", "completed"]>>;
    /** User rating (0-10) */
    rating: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** User notes */
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    /** Date added */
    dateAdded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    /** Streaming providers */
    streamingProviders: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Whether this item has an existing entry in the user's watchlist (duplicate) */
    hasExistingEntry: z.ZodDefault<z.ZodBoolean>;
    /** The existing entry ID if duplicate */
    existingEntryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    /** Whether this item should be skipped (user decision or error) */
    shouldSkip: z.ZodDefault<z.ZodBoolean>;
    /** Error message if item couldn't be processed */
    error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    streamingProviders: string[];
    originalTitle: string;
    matchCandidates: {
        title: string;
        tmdbId: number;
        tmdbType: "movie" | "tv";
        posterPath: string | null;
        confidence: number;
        year?: number | null | undefined;
        backdropPath?: string | null | undefined;
        overview?: string | null | undefined;
    }[];
    suggestedStatus: "not_watched" | "watching" | "completed";
    hasExistingEntry: boolean;
    shouldSkip: boolean;
    rating?: number | null | undefined;
    notes?: string | null | undefined;
    dateAdded?: string | null | undefined;
    originalYear?: number | null | undefined;
    selectedMatchIndex?: number | null | undefined;
    existingEntryId?: string | null | undefined;
    error?: string | null | undefined;
}, {
    originalTitle: string;
    rating?: number | null | undefined;
    notes?: string | null | undefined;
    dateAdded?: string | null | undefined;
    streamingProviders?: string[] | undefined;
    originalYear?: number | null | undefined;
    matchCandidates?: {
        title: string;
        tmdbId: number;
        tmdbType: "movie" | "tv";
        posterPath: string | null;
        confidence: number;
        year?: number | null | undefined;
        backdropPath?: string | null | undefined;
        overview?: string | null | undefined;
    }[] | undefined;
    selectedMatchIndex?: number | null | undefined;
    suggestedStatus?: "not_watched" | "watching" | "completed" | undefined;
    hasExistingEntry?: boolean | undefined;
    existingEntryId?: string | null | undefined;
    shouldSkip?: boolean | undefined;
    error?: string | null | undefined;
}>;
export type NormalizedPreviewItem = z.infer<typeof normalizedPreviewItemSchema>;
/**
 * Enum for duplicate resolution strategies.
 */
export declare const duplicateResolutionStrategySchema: z.ZodEnum<["skip", "overwrite", "merge"]>;
export type DuplicateResolutionStrategy = z.infer<typeof duplicateResolutionStrategySchema>;
/**
 * Schema for merge payload fields.
 * Specifies which fields to update when merging duplicate entries.
 */
export declare const mergeFieldsSchema: z.ZodObject<{
    /** Update the watch status */
    status: z.ZodDefault<z.ZodBoolean>;
    /** Update the rating */
    rating: z.ZodDefault<z.ZodBoolean>;
    /** Append or replace notes */
    notes: z.ZodDefault<z.ZodEnum<["append", "replace", "keep"]>>;
    /** Update streaming providers */
    streamingProviders: z.ZodDefault<z.ZodEnum<["merge", "replace", "keep"]>>;
}, "strip", z.ZodTypeAny, {
    status: boolean;
    rating: boolean;
    notes: "append" | "replace" | "keep";
    streamingProviders: "merge" | "replace" | "keep";
}, {
    status?: boolean | undefined;
    rating?: boolean | undefined;
    notes?: "append" | "replace" | "keep" | undefined;
    streamingProviders?: "merge" | "replace" | "keep" | undefined;
}>;
export type MergeFields = z.infer<typeof mergeFieldsSchema>;
/**
 * Schema for duplicate resolution instructions.
 * Tells the API how to handle a specific duplicate entry.
 */
export declare const duplicateResolutionSchema: z.ZodObject<{
    /** The preview item ID or index being resolved */
    itemIndex: z.ZodNumber;
    /** The resolution strategy to use */
    strategy: z.ZodEnum<["skip", "overwrite", "merge"]>;
    /** Merge instructions (only used when strategy is 'merge') */
    mergeFields: z.ZodOptional<z.ZodObject<{
        /** Update the watch status */
        status: z.ZodDefault<z.ZodBoolean>;
        /** Update the rating */
        rating: z.ZodDefault<z.ZodBoolean>;
        /** Append or replace notes */
        notes: z.ZodDefault<z.ZodEnum<["append", "replace", "keep"]>>;
        /** Update streaming providers */
        streamingProviders: z.ZodDefault<z.ZodEnum<["merge", "replace", "keep"]>>;
    }, "strip", z.ZodTypeAny, {
        status: boolean;
        rating: boolean;
        notes: "append" | "replace" | "keep";
        streamingProviders: "merge" | "replace" | "keep";
    }, {
        status?: boolean | undefined;
        rating?: boolean | undefined;
        notes?: "append" | "replace" | "keep" | undefined;
        streamingProviders?: "merge" | "replace" | "keep" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    itemIndex: number;
    strategy: "skip" | "overwrite" | "merge";
    mergeFields?: {
        status: boolean;
        rating: boolean;
        notes: "append" | "replace" | "keep";
        streamingProviders: "merge" | "replace" | "keep";
    } | undefined;
}, {
    itemIndex: number;
    strategy: "skip" | "overwrite" | "merge";
    mergeFields?: {
        status?: boolean | undefined;
        rating?: boolean | undefined;
        notes?: "append" | "replace" | "keep" | undefined;
        streamingProviders?: "merge" | "replace" | "keep" | undefined;
    } | undefined;
}>;
export type DuplicateResolution = z.infer<typeof duplicateResolutionSchema>;
/**
 * Schema for a bulk import request.
 * Contains the preview items and resolution instructions.
 */
export declare const bulkImportRequestSchema: z.ZodObject<{
    /** List of preview items to import */
    items: z.ZodArray<z.ZodObject<{
        /** The original title from the import */
        originalTitle: z.ZodString;
        /** The original year from the import (if provided) */
        originalYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        /** List of potential TMDB matches, ordered by confidence score (descending) */
        matchCandidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
            /** TMDB identifier for the media item */
            tmdbId: z.ZodNumber;
            /** Type of media: 'movie' or 'tv' */
            tmdbType: z.ZodEnum<["movie", "tv"]>;
            /** Title from TMDB */
            title: z.ZodString;
            /** Release year from TMDB */
            year: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            /** Poster image path from TMDB */
            posterPath: z.ZodNullable<z.ZodString>;
            /** Backdrop image path from TMDB */
            backdropPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            /** Overview/description from TMDB */
            overview: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            /**
             * Confidence score (0-1) indicating how likely this is the correct match.
             * Based on title similarity, year match, and other factors.
             */
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            title: string;
            tmdbId: number;
            tmdbType: "movie" | "tv";
            posterPath: string | null;
            confidence: number;
            year?: number | null | undefined;
            backdropPath?: string | null | undefined;
            overview?: string | null | undefined;
        }, {
            title: string;
            tmdbId: number;
            tmdbType: "movie" | "tv";
            posterPath: string | null;
            confidence: number;
            year?: number | null | undefined;
            backdropPath?: string | null | undefined;
            overview?: string | null | undefined;
        }>, "many">>;
        /** The user's selected match (if they've made a choice) */
        selectedMatchIndex: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        /** Normalized watch status */
        suggestedStatus: z.ZodDefault<z.ZodEnum<["not_watched", "watching", "completed"]>>;
        /** User rating (0-10) */
        rating: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        /** User notes */
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        /** Date added */
        dateAdded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        /** Streaming providers */
        streamingProviders: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Whether this item has an existing entry in the user's watchlist (duplicate) */
        hasExistingEntry: z.ZodDefault<z.ZodBoolean>;
        /** The existing entry ID if duplicate */
        existingEntryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        /** Whether this item should be skipped (user decision or error) */
        shouldSkip: z.ZodDefault<z.ZodBoolean>;
        /** Error message if item couldn't be processed */
        error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        streamingProviders: string[];
        originalTitle: string;
        matchCandidates: {
            title: string;
            tmdbId: number;
            tmdbType: "movie" | "tv";
            posterPath: string | null;
            confidence: number;
            year?: number | null | undefined;
            backdropPath?: string | null | undefined;
            overview?: string | null | undefined;
        }[];
        suggestedStatus: "not_watched" | "watching" | "completed";
        hasExistingEntry: boolean;
        shouldSkip: boolean;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        dateAdded?: string | null | undefined;
        originalYear?: number | null | undefined;
        selectedMatchIndex?: number | null | undefined;
        existingEntryId?: string | null | undefined;
        error?: string | null | undefined;
    }, {
        originalTitle: string;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        dateAdded?: string | null | undefined;
        streamingProviders?: string[] | undefined;
        originalYear?: number | null | undefined;
        matchCandidates?: {
            title: string;
            tmdbId: number;
            tmdbType: "movie" | "tv";
            posterPath: string | null;
            confidence: number;
            year?: number | null | undefined;
            backdropPath?: string | null | undefined;
            overview?: string | null | undefined;
        }[] | undefined;
        selectedMatchIndex?: number | null | undefined;
        suggestedStatus?: "not_watched" | "watching" | "completed" | undefined;
        hasExistingEntry?: boolean | undefined;
        existingEntryId?: string | null | undefined;
        shouldSkip?: boolean | undefined;
        error?: string | null | undefined;
    }>, "many">;
    /** List of duplicate resolution instructions */
    resolutions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** The preview item ID or index being resolved */
        itemIndex: z.ZodNumber;
        /** The resolution strategy to use */
        strategy: z.ZodEnum<["skip", "overwrite", "merge"]>;
        /** Merge instructions (only used when strategy is 'merge') */
        mergeFields: z.ZodOptional<z.ZodObject<{
            /** Update the watch status */
            status: z.ZodDefault<z.ZodBoolean>;
            /** Update the rating */
            rating: z.ZodDefault<z.ZodBoolean>;
            /** Append or replace notes */
            notes: z.ZodDefault<z.ZodEnum<["append", "replace", "keep"]>>;
            /** Update streaming providers */
            streamingProviders: z.ZodDefault<z.ZodEnum<["merge", "replace", "keep"]>>;
        }, "strip", z.ZodTypeAny, {
            status: boolean;
            rating: boolean;
            notes: "append" | "replace" | "keep";
            streamingProviders: "merge" | "replace" | "keep";
        }, {
            status?: boolean | undefined;
            rating?: boolean | undefined;
            notes?: "append" | "replace" | "keep" | undefined;
            streamingProviders?: "merge" | "replace" | "keep" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        itemIndex: number;
        strategy: "skip" | "overwrite" | "merge";
        mergeFields?: {
            status: boolean;
            rating: boolean;
            notes: "append" | "replace" | "keep";
            streamingProviders: "merge" | "replace" | "keep";
        } | undefined;
    }, {
        itemIndex: number;
        strategy: "skip" | "overwrite" | "merge";
        mergeFields?: {
            status?: boolean | undefined;
            rating?: boolean | undefined;
            notes?: "append" | "replace" | "keep" | undefined;
            streamingProviders?: "merge" | "replace" | "keep" | undefined;
        } | undefined;
    }>, "many">>;
    /** Whether to skip items that couldn't be matched to TMDB */
    skipUnmatched: z.ZodDefault<z.ZodBoolean>;
    /** Default resolution strategy for duplicates not explicitly resolved */
    defaultDuplicateStrategy: z.ZodDefault<z.ZodEnum<["skip", "overwrite", "merge"]>>;
}, "strip", z.ZodTypeAny, {
    items: {
        streamingProviders: string[];
        originalTitle: string;
        matchCandidates: {
            title: string;
            tmdbId: number;
            tmdbType: "movie" | "tv";
            posterPath: string | null;
            confidence: number;
            year?: number | null | undefined;
            backdropPath?: string | null | undefined;
            overview?: string | null | undefined;
        }[];
        suggestedStatus: "not_watched" | "watching" | "completed";
        hasExistingEntry: boolean;
        shouldSkip: boolean;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        dateAdded?: string | null | undefined;
        originalYear?: number | null | undefined;
        selectedMatchIndex?: number | null | undefined;
        existingEntryId?: string | null | undefined;
        error?: string | null | undefined;
    }[];
    resolutions: {
        itemIndex: number;
        strategy: "skip" | "overwrite" | "merge";
        mergeFields?: {
            status: boolean;
            rating: boolean;
            notes: "append" | "replace" | "keep";
            streamingProviders: "merge" | "replace" | "keep";
        } | undefined;
    }[];
    skipUnmatched: boolean;
    defaultDuplicateStrategy: "skip" | "overwrite" | "merge";
}, {
    items: {
        originalTitle: string;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        dateAdded?: string | null | undefined;
        streamingProviders?: string[] | undefined;
        originalYear?: number | null | undefined;
        matchCandidates?: {
            title: string;
            tmdbId: number;
            tmdbType: "movie" | "tv";
            posterPath: string | null;
            confidence: number;
            year?: number | null | undefined;
            backdropPath?: string | null | undefined;
            overview?: string | null | undefined;
        }[] | undefined;
        selectedMatchIndex?: number | null | undefined;
        suggestedStatus?: "not_watched" | "watching" | "completed" | undefined;
        hasExistingEntry?: boolean | undefined;
        existingEntryId?: string | null | undefined;
        shouldSkip?: boolean | undefined;
        error?: string | null | undefined;
    }[];
    resolutions?: {
        itemIndex: number;
        strategy: "skip" | "overwrite" | "merge";
        mergeFields?: {
            status?: boolean | undefined;
            rating?: boolean | undefined;
            notes?: "append" | "replace" | "keep" | undefined;
            streamingProviders?: "merge" | "replace" | "keep" | undefined;
        } | undefined;
    }[] | undefined;
    skipUnmatched?: boolean | undefined;
    defaultDuplicateStrategy?: "skip" | "overwrite" | "merge" | undefined;
}>;
export type BulkImportRequest = z.infer<typeof bulkImportRequestSchema>;
/**
 * Schema for the result of a bulk import operation.
 */
export declare const importResultSchema: z.ZodObject<{
    /** Number of items successfully imported */
    imported: z.ZodNumber;
    /** Number of items skipped */
    skipped: z.ZodNumber;
    /** Number of items that failed to import */
    failed: z.ZodNumber;
    /** Number of duplicates that were merged */
    merged: z.ZodNumber;
    /** Number of duplicates that were overwritten */
    overwritten: z.ZodNumber;
    /** List of error messages for failed items */
    errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
        itemIndex: z.ZodNumber;
        title: z.ZodString;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        error: string;
        itemIndex: number;
    }, {
        title: string;
        error: string;
        itemIndex: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    imported: number;
    skipped: number;
    failed: number;
    merged: number;
    overwritten: number;
    errors: {
        title: string;
        error: string;
        itemIndex: number;
    }[];
}, {
    imported: number;
    skipped: number;
    failed: number;
    merged: number;
    overwritten: number;
    errors?: {
        title: string;
        error: string;
        itemIndex: number;
    }[] | undefined;
}>;
export type ImportResult = z.infer<typeof importResultSchema>;
/**
 * Schema for exported watchlist data.
 * Designed to be easily re-imported.
 */
export declare const exportedWatchlistEntrySchema: z.ZodObject<{
    /** Title of the media item */
    title: z.ZodString;
    /** Release year */
    year: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** Media type */
    type: z.ZodEnum<["movie", "tv"]>;
    /** Watch status */
    status: z.ZodEnum<["not_watched", "watching", "completed"]>;
    /** User rating (0-10) */
    rating: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** User notes */
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    /** Date added to watchlist */
    dateAdded: z.ZodString;
    /** Date watched/completed */
    dateWatched: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    /** Streaming providers */
    streamingProviders: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** TMDB ID for re-import matching */
    tmdbId: z.ZodOptional<z.ZodNumber>;
    /** Poster path from TMDB */
    posterPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    status: "not_watched" | "watching" | "completed";
    type: "movie" | "tv";
    dateAdded: string;
    streamingProviders: string[];
    year?: number | null | undefined;
    rating?: number | null | undefined;
    notes?: string | null | undefined;
    tmdbId?: number | undefined;
    posterPath?: string | null | undefined;
    dateWatched?: string | null | undefined;
}, {
    title: string;
    status: "not_watched" | "watching" | "completed";
    type: "movie" | "tv";
    dateAdded: string;
    year?: number | null | undefined;
    rating?: number | null | undefined;
    notes?: string | null | undefined;
    streamingProviders?: string[] | undefined;
    tmdbId?: number | undefined;
    posterPath?: string | null | undefined;
    dateWatched?: string | null | undefined;
}>;
export type ExportedWatchlistEntry = z.infer<typeof exportedWatchlistEntrySchema>;
/**
 * Schema for the complete export response.
 */
export declare const exportResponseSchema: z.ZodObject<{
    /** Export timestamp */
    exportedAt: z.ZodString;
    /** User ID who exported the data */
    userId: z.ZodString;
    /** Export format version for future compatibility */
    version: z.ZodDefault<z.ZodString>;
    /** Total number of entries */
    totalEntries: z.ZodNumber;
    /** The exported watchlist entries */
    entries: z.ZodArray<z.ZodObject<{
        /** Title of the media item */
        title: z.ZodString;
        /** Release year */
        year: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        /** Media type */
        type: z.ZodEnum<["movie", "tv"]>;
        /** Watch status */
        status: z.ZodEnum<["not_watched", "watching", "completed"]>;
        /** User rating (0-10) */
        rating: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        /** User notes */
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        /** Date added to watchlist */
        dateAdded: z.ZodString;
        /** Date watched/completed */
        dateWatched: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        /** Streaming providers */
        streamingProviders: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** TMDB ID for re-import matching */
        tmdbId: z.ZodOptional<z.ZodNumber>;
        /** Poster path from TMDB */
        posterPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        status: "not_watched" | "watching" | "completed";
        type: "movie" | "tv";
        dateAdded: string;
        streamingProviders: string[];
        year?: number | null | undefined;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        tmdbId?: number | undefined;
        posterPath?: string | null | undefined;
        dateWatched?: string | null | undefined;
    }, {
        title: string;
        status: "not_watched" | "watching" | "completed";
        type: "movie" | "tv";
        dateAdded: string;
        year?: number | null | undefined;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        streamingProviders?: string[] | undefined;
        tmdbId?: number | undefined;
        posterPath?: string | null | undefined;
        dateWatched?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    entries: {
        title: string;
        status: "not_watched" | "watching" | "completed";
        type: "movie" | "tv";
        dateAdded: string;
        streamingProviders: string[];
        year?: number | null | undefined;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        tmdbId?: number | undefined;
        posterPath?: string | null | undefined;
        dateWatched?: string | null | undefined;
    }[];
    exportedAt: string;
    userId: string;
    version: string;
    totalEntries: number;
}, {
    entries: {
        title: string;
        status: "not_watched" | "watching" | "completed";
        type: "movie" | "tv";
        dateAdded: string;
        year?: number | null | undefined;
        rating?: number | null | undefined;
        notes?: string | null | undefined;
        streamingProviders?: string[] | undefined;
        tmdbId?: number | undefined;
        posterPath?: string | null | undefined;
        dateWatched?: string | null | undefined;
    }[];
    exportedAt: string;
    userId: string;
    totalEntries: number;
    version?: string | undefined;
}>;
export type ExportResponse = z.infer<typeof exportResponseSchema>;
//# sourceMappingURL=importExport.d.ts.map