# Import/Export Schemas Implementation Summary

## Overview

Implemented a comprehensive shared data contract for import/export functionality in the InFocus platform. The schemas and utilities enable consistent data handling across API, web, and mobile applications.

## Files Created

### 1. Schemas (`packages/shared/src/schemas/importExport.ts`)

Created comprehensive Zod schemas with full JSDoc documentation:

#### Raw Watchlist Row Schema
- **Purpose**: Parse CSV/Excel imports with flexible validation
- **Fields**: title (required), year, status, rating (0-10), notes, dateAdded, streamingProviders
- **Features**: Automatic trimming, defaults, max length validation

#### TMDB Match Candidate Schema
- **Purpose**: Represent potential TMDB matches with confidence scoring
- **Fields**: tmdbId, tmdbType (movie/tv), title, year, posterPath, backdropPath, overview, confidence (0-1)
- **Features**: Confidence scoring for match quality

#### Normalized Preview Item Schema
- **Purpose**: Display import preview with match candidates
- **Fields**: originalTitle, originalYear, matchCandidates[], selectedMatchIndex, suggestedStatus, rating, notes, dateAdded, streamingProviders, hasExistingEntry, existingEntryId, shouldSkip, error
- **Features**: Tracks duplicates, errors, and user selections

#### Duplicate Resolution Schemas
- **Strategies**: skip, overwrite, merge
- **Merge Fields**: Granular control over which fields to update
  - status: boolean
  - rating: boolean
  - notes: 'append' | 'replace' | 'keep'
  - streamingProviders: 'merge' | 'replace' | 'keep'

#### Bulk Import Request Schema
- **Purpose**: Submit batch imports with resolution instructions
- **Fields**: items[], resolutions[], skipUnmatched, defaultDuplicateStrategy
- **Features**: Configurable duplicate handling

#### Import Result Schema
- **Purpose**: Report import operation results
- **Fields**: imported, skipped, failed, merged, overwritten, errors[]
- **Features**: Detailed error tracking

#### Export Schemas
- **ExportedWatchlistEntry**: Standard format for exported data
- **ExportResponse**: Complete export with metadata and versioning
- **Features**: Version tracking, re-import compatibility

### 2. Utilities (`packages/shared/src/utils/importExport.ts`)

Created five helper functions with comprehensive documentation:

#### normalizeWatchStatus()
- **Purpose**: Normalize user status strings to valid WatchStatus values
- **Handles**: 20+ variations (watched, done, finished, in progress, to watch, etc.)
- **Default**: Falls back to 'not_watched'

#### parseStreamingProviders()
- **Purpose**: Parse streaming providers from multiple formats
- **Supports**:
  - Array of strings: `["Netflix", "Hulu"]`
  - CSV: `"Netflix, Hulu"`
  - JSON: `'["Netflix", "Hulu"]'`
  - Semicolon/pipe separated: `"Netflix; Hulu"`, `"Netflix | Hulu"`
  - Single provider: `"Netflix"`
- **Features**: Lowercase normalization, whitespace trimming, empty filtering

#### normalizeDateString()
- **Purpose**: Convert various date formats to ISO 8601
- **Supports**:
  - ISO dates: `"2024-01-15"` or `"2024-01-15T00:00:00.000Z"`
  - US format: `"01/15/2024"` or `"1/15/2024"`
  - EU format: `"15/01/2024"` or `"15.01.2024"`
  - Date objects
  - Timestamps
- **Returns**: ISO 8601 string or null if invalid

#### calculateMatchConfidence()
- **Purpose**: Score TMDB match candidates (0-1 range)
- **Factors**:
  - Exact title match: +0.5
  - Partial title match: +0.3 (scaled by similarity)
  - Year match: +0.3
  - Year off by 1: +0.15
  - Has poster: +0.05
  - High-confidence bonus: +0.15
- **Features**: Case-insensitive, special character handling, word similarity

#### normalizeRating()
- **Purpose**: Convert ratings from different scales to 0-10
- **Supports**:
  - 5-star scale → 10-point (e.g., 4.5 stars = 9)
  - Percentage → 10-point (e.g., 85% = 9)
  - 10-point scale (validated)
- **Features**: Rounding, clamping to 0-10

### 3. Unit Tests

#### Schema Tests (`packages/shared/src/schemas/importExport.test.ts`)
- **Coverage**: All schemas with valid/invalid cases
- **Test Cases**:
  - Raw watchlist row validation (CSV-style data)
  - TMDB match candidates
  - Normalized preview items with errors
  - Duplicate resolution strategies
  - Bulk import requests
  - Import results
  - Export responses
  - JSON payload validation
- **Total**: 20+ test suites

#### Utility Tests (`packages/shared/src/utils/importExport.test.ts`)
- **Coverage**: All utility functions with edge cases
- **Test Cases**:
  - Status normalization (20+ variations)
  - Streaming provider parsing (8+ formats)
  - Date normalization (6+ formats)
  - Match confidence calculation
  - Rating normalization (3 scales)
  - Integration scenarios
- **Total**: 70+ test cases

### 4. Documentation

#### README (`packages/shared/README.md`)
- **Sections**:
  - Overview and features
  - Installation instructions
  - Usage examples for all schemas
  - Utility function documentation
  - Duplicate resolution strategies
  - Development commands
  - Guidelines for adding new schemas
- **Examples**: 15+ code snippets with realistic data

### 5. Configuration Updates

#### Schema Exports (`packages/shared/src/schemas/index.ts`)
```typescript
export * from './importExport';
```

#### Type Exports (`packages/shared/src/types/index.ts`)
```typescript
export type {
  RawWatchlistRow,
  TmdbMatchCandidate,
  NormalizedPreviewItem,
  DuplicateResolutionStrategy,
  MergeFields,
  DuplicateResolution,
  BulkImportRequest,
  ImportResult,
  ExportedWatchlistEntry,
  ExportResponse,
} from '../schemas/importExport';
```

#### Utility Exports (`packages/shared/src/utils/index.ts`)
```typescript
export * from './importExport';
```

#### TypeScript Config (`packages/shared/tsconfig.json`)
- Updated lib from `["es2015", "dom"]` to `["ES2020", "dom"]`
- Ensures compatibility with modern array methods (includes, etc.)

## Key Features

### 1. Type Safety
- Full TypeScript type inference from Zod schemas
- Compile-time type checking across all consumers
- Runtime validation for external data

### 2. Flexibility
- Handles CSV, JSON, and various data formats
- Configurable duplicate resolution
- Extensible schema design

### 3. Robustness
- Comprehensive validation with descriptive errors
- Graceful fallbacks for user input
- Multiple format support (dates, providers, statuses)

### 4. Documentation
- Extensive JSDoc comments on all schemas and functions
- Usage examples in README
- Integration scenarios in tests

### 5. Testability
- 90+ unit tests covering edge cases
- Integration test scenarios
- Mock-friendly design

## Usage Examples

### Import Flow (API)
```typescript
import {
  rawWatchlistRowSchema,
  normalizedPreviewItemSchema,
  normalizeWatchStatus,
  parseStreamingProviders,
  calculateMatchConfidence,
} from '@infocus/shared';

// 1. Parse CSV row
const rawRow = rawWatchlistRowSchema.parse(csvData);

// 2. Normalize data
const status = normalizeWatchStatus(rawRow.status);
const providers = parseStreamingProviders(rawRow.streamingProviders);

// 3. Search TMDB and create preview
const matches = await searchTMDB(rawRow.title, rawRow.year);
const preview = normalizedPreviewItemSchema.parse({
  originalTitle: rawRow.title,
  originalYear: rawRow.year,
  matchCandidates: matches.map(m => ({
    ...m,
    confidence: calculateMatchConfidence(m.title, m.year, rawRow.title, rawRow.year, !!m.posterPath),
  })),
  suggestedStatus: status,
  rating: rawRow.rating,
});
```

### Import Flow (Web/Mobile)
```typescript
import {
  bulkImportRequestSchema,
  type BulkImportRequest,
  type DuplicateResolution,
} from '@infocus/shared';

// User resolves duplicates in UI
const resolutions: DuplicateResolution[] = [
  {
    itemIndex: 0,
    strategy: 'merge',
    mergeFields: {
      status: true,
      rating: true,
      notes: 'append',
      streamingProviders: 'merge',
    },
  },
];

// Submit import request
const request: BulkImportRequest = {
  items: previewItems,
  resolutions,
  skipUnmatched: false,
  defaultDuplicateStrategy: 'skip',
};

await api.post('/watchlist/import', bulkImportRequestSchema.parse(request));
```

### Export Flow
```typescript
import {
  exportResponseSchema,
  type ExportResponse,
} from '@infocus/shared';

// API generates export
const response: ExportResponse = exportResponseSchema.parse({
  exportedAt: new Date().toISOString(),
  userId: user.id,
  version: '1.0',
  totalEntries: entries.length,
  entries: entries.map(e => ({
    title: e.mediaItem.title,
    year: e.mediaItem.releaseDate ? new Date(e.mediaItem.releaseDate).getFullYear() : null,
    type: e.mediaItem.tmdbType,
    status: e.status,
    rating: e.rating,
    notes: e.notes,
    dateAdded: e.dateAdded.toISOString(),
    dateWatched: e.watchedAt?.toISOString() ?? null,
    streamingProviders: e.mediaItem.streamingProviders.map(p => p.provider),
    tmdbId: e.mediaItem.tmdbId,
  })),
});
```

## Benefits

### For API Developers
- Single source of truth for validation
- Reduced boilerplate code
- Consistent error messages

### For Frontend Developers
- Type safety in API requests/responses
- Predictable data structures
- Shared utilities for data processing

### For Mobile Developers
- Same schemas and utilities as web
- Consistent behavior across platforms
- Reduced testing burden

### For Users
- Better error handling
- Flexible import formats
- Granular duplicate control

## Next Steps

### API Implementation
1. Create `/watchlist/import/preview` endpoint
   - Parse CSV/JSON
   - Search TMDB
   - Return normalized preview items
2. Create `/watchlist/import` endpoint
   - Process bulk import request
   - Handle duplicates per resolution strategy
   - Return import result
3. Create `/watchlist/export` endpoint
   - Generate export response
   - Support CSV and JSON formats

### Web/Mobile Implementation
1. Import UI
   - File upload (CSV/JSON)
   - Preview table with match selection
   - Duplicate resolution controls
2. Export UI
   - Format selection (CSV/JSON)
   - Download/share functionality

## Testing Results

All schemas and utilities have been tested with:
- ✅ Valid data scenarios
- ✅ Invalid data scenarios
- ✅ Edge cases (empty, null, undefined)
- ✅ Multiple format variations
- ✅ Integration scenarios

Total test coverage: 90+ test cases across 30+ test suites

## Compatibility

- **Node.js**: >=18.0.0
- **TypeScript**: >=5.0.0
- **Zod**: ^3.25.76
- **Browsers**: ES2020+ (all modern browsers)

## Version

- **Schema Version**: 1.0
- **Package**: @infocus/shared@1.0.0
