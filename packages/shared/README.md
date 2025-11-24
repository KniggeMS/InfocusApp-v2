# @infocus/shared

Shared domain models, types, schemas, and utilities for the InFocus platform.

This package provides a single source of truth for data contracts across the API, web, and mobile applications.

## Features

- **Zod Schemas**: Runtime validation for domain entities
- **TypeScript Types**: Shared type definitions for type safety
- **Utility Functions**: Common helpers for data processing
- **Import/Export Contracts**: Standardized schemas for watchlist import/export

## Installation

This package is part of the InFocus monorepo and is installed automatically as a workspace dependency:

```bash
pnpm install
```

## Usage

### Import/Export Schemas

The import/export schemas provide a standardized data contract for importing and exporting watchlist data across all platforms.

#### Raw Watchlist Row

Use for parsing CSV or user-provided data:

```typescript
import { rawWatchlistRowSchema, type RawWatchlistRow } from '@infocus/shared';

// Parse a CSV row
const row = rawWatchlistRowSchema.parse({
  title: 'Inception',
  year: 2010,
  status: 'completed',
  rating: 9,
  notes: 'Amazing movie!',
  dateAdded: '2024-01-15',
  streamingProviders: ['netflix', 'hulu'],
});
```

#### Normalized Preview Item

Use for displaying import preview with TMDB match candidates:

```typescript
import {
  normalizedPreviewItemSchema,
  type NormalizedPreviewItem,
} from '@infocus/shared';

const preview = normalizedPreviewItemSchema.parse({
  originalTitle: 'Inception',
  originalYear: 2010,
  matchCandidates: [
    {
      tmdbId: 27205,
      tmdbType: 'movie',
      title: 'Inception',
      year: 2010,
      posterPath: '/path/to/poster.jpg',
      confidence: 0.98,
    },
  ],
  selectedMatchIndex: 0,
  suggestedStatus: 'completed',
  rating: 9,
});
```

#### Bulk Import Request

Use for submitting a batch import with duplicate resolution:

```typescript
import {
  bulkImportRequestSchema,
  type BulkImportRequest,
} from '@infocus/shared';

const request = bulkImportRequestSchema.parse({
  items: [
    /* preview items */
  ],
  resolutions: [
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
  ],
  skipUnmatched: false,
  defaultDuplicateStrategy: 'skip',
});
```

#### Export Response

Use for exporting watchlist data:

```typescript
import {
  exportResponseSchema,
  type ExportResponse,
} from '@infocus/shared';

const exportData = exportResponseSchema.parse({
  exportedAt: new Date().toISOString(),
  userId: 'clx123456789',
  version: '1.0',
  totalEntries: 10,
  entries: [
    {
      title: 'Inception',
      year: 2010,
      type: 'movie',
      status: 'completed',
      rating: 9,
      notes: 'Amazing!',
      dateAdded: '2024-01-15T00:00:00.000Z',
      streamingProviders: ['netflix'],
      tmdbId: 27205,
    },
  ],
});
```

### Utility Functions

#### Status Normalization

Normalize user-provided status strings to valid values:

```typescript
import { normalizeWatchStatus } from '@infocus/shared';

normalizeWatchStatus('Watched'); // returns 'completed'
normalizeWatchStatus('in progress'); // returns 'watching'
normalizeWatchStatus('to watch'); // returns 'not_watched'
```

#### Streaming Provider Parsing

Parse streaming providers from various formats:

```typescript
import { parseStreamingProviders } from '@infocus/shared';

parseStreamingProviders(['Netflix', 'Hulu']); // ['netflix', 'hulu']
parseStreamingProviders('Netflix, Hulu'); // ['netflix', 'hulu']
parseStreamingProviders('["Netflix", "Hulu"]'); // ['netflix', 'hulu']
parseStreamingProviders('Netflix'); // ['netflix']
```

#### Date Normalization

Normalize dates from various formats to ISO 8601:

```typescript
import { normalizeDateString } from '@infocus/shared';

normalizeDateString('2024-01-15'); // '2024-01-15T00:00:00.000Z'
normalizeDateString('01/15/2024'); // '2024-01-15T00:00:00.000Z'
normalizeDateString('15.01.2024'); // '2024-01-15T00:00:00.000Z'
```

#### Match Confidence Calculation

Calculate confidence scores for TMDB match candidates:

```typescript
import { calculateMatchConfidence } from '@infocus/shared';

const confidence = calculateMatchConfidence(
  'Inception', // TMDB title
  2010, // TMDB year
  'Inception', // User's title
  2010, // User's year
  true // Has poster
);
// Returns: 1.0 (perfect match)
```

#### Rating Normalization

Normalize ratings from different scales:

```typescript
import { normalizeRating } from '@infocus/shared';

normalizeRating(5, 5); // 10 (5-star to 10-point)
normalizeRating(85, 100); // 9 (percentage to 10-point)
normalizeRating(7.8, 10); // 8 (rounded)
```

### Other Schemas

#### Media Item

```typescript
import { mediaItemSchema, type MediaItemSchema } from '@infocus/shared';
```

#### Watchlist Entry

```typescript
import { watchlistEntrySchema, type WatchlistEntrySchema } from '@infocus/shared';
```

## Schema Validation

All schemas are built with Zod and provide:

- **Runtime validation**: Catch invalid data at runtime
- **Type inference**: Automatically generate TypeScript types
- **Error messages**: Detailed validation errors
- **Transformations**: Automatic data normalization (trimming, defaults, etc.)

Example validation:

```typescript
import { rawWatchlistRowSchema } from '@infocus/shared';

try {
  const row = rawWatchlistRowSchema.parse(userData);
  // row is now validated and typed
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors);
  }
}
```

## Duplicate Resolution Strategies

When importing watchlist data, duplicates can be handled with three strategies:

### 1. Skip

Skip the imported item, keep existing entry unchanged:

```typescript
{
  strategy: 'skip'
}
```

### 2. Overwrite

Replace the existing entry completely with imported data:

```typescript
{
  strategy: 'overwrite'
}
```

### 3. Merge

Merge imported data with existing entry using specified rules:

```typescript
{
  strategy: 'merge',
  mergeFields: {
    status: true,           // Update status
    rating: true,           // Update rating
    notes: 'append',        // 'append', 'replace', or 'keep'
    streamingProviders: 'merge' // 'merge', 'replace', or 'keep'
  }
}
```

## Development

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

## Adding New Schemas

1. Create a new schema file in `src/schemas/`
2. Export the schema and infer the TypeScript type
3. Add the export to `src/schemas/index.ts`
4. Add the type export to `src/types/index.ts`
5. Write tests in a `.test.ts` file alongside the schema

Example:

```typescript
// src/schemas/mySchema.ts
import { z } from 'zod';

export const mySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
});

export type MySchema = z.infer<typeof mySchema>;
```

```typescript
// src/schemas/index.ts
export * from './mySchema';
```

```typescript
// src/types/index.ts
export type { MySchema } from '../schemas/mySchema';
```

## License

MIT
