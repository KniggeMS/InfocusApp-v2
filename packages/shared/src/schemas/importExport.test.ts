import {
  rawWatchlistRowSchema,
  tmdbMatchCandidateSchema,
  normalizedPreviewItemSchema,
  duplicateResolutionSchema,
  bulkImportRequestSchema,
  importResultSchema,
  exportedWatchlistEntrySchema,
  exportResponseSchema,
} from './importExport';

describe('Import/Export Schemas', () => {
  describe('rawWatchlistRowSchema', () => {
    it('validates a valid raw watchlist row', () => {
      const validRow = {
        title: 'Inception',
        year: 2010,
        status: 'completed',
        rating: 9,
        notes: 'Amazing movie!',
        dateAdded: '2024-01-15',
        streamingProviders: ['netflix', 'hulu'],
      };

      const result = rawWatchlistRowSchema.parse(validRow);
      expect(result.title).toBe('Inception');
      expect(result.year).toBe(2010);
      expect(result.status).toBe('completed');
      expect(result.rating).toBe(9);
    });

    it('applies defaults for optional fields', () => {
      const minimalRow = {
        title: 'The Matrix',
      };

      const result = rawWatchlistRowSchema.parse(minimalRow);
      expect(result.title).toBe('The Matrix');
      expect(result.status).toBe('not_watched');
      expect(result.streamingProviders).toEqual([]);
    });

    it('trims whitespace from title', () => {
      const row = {
        title: '  Inception  ',
      };

      const result = rawWatchlistRowSchema.parse(row);
      expect(result.title).toBe('Inception');
    });

    it('rejects empty titles', () => {
      const row = {
        title: '',
      };

      expect(() => rawWatchlistRowSchema.parse(row)).toThrow();
    });

    it('rejects ratings outside 0-10 range', () => {
      const row = {
        title: 'Inception',
        rating: 11,
      };

      expect(() => rawWatchlistRowSchema.parse(row)).toThrow();
    });

    it('validates year range', () => {
      const validRow = {
        title: 'Inception',
        year: 2010,
      };
      expect(() => rawWatchlistRowSchema.parse(validRow)).not.toThrow();

      const oldRow = {
        title: 'Old Movie',
        year: 1800,
      };
      expect(() => rawWatchlistRowSchema.parse(oldRow)).not.toThrow();

      const invalidRow = {
        title: 'Future Movie',
        year: 2101,
      };
      expect(() => rawWatchlistRowSchema.parse(invalidRow)).toThrow();
    });

    it('accepts CSV-style data with string status', () => {
      const csvRow = {
        title: 'Breaking Bad',
        year: 2008,
        status: 'watching',
        rating: 10,
        notes: 'Best TV show ever',
        dateAdded: '2024-01-01T00:00:00.000Z',
        streamingProviders: ['netflix'],
      };

      const result = rawWatchlistRowSchema.parse(csvRow);
      expect(result.status).toBe('watching');
    });
  });

  describe('tmdbMatchCandidateSchema', () => {
    it('validates a complete match candidate', () => {
      const candidate = {
        tmdbId: 27205,
        tmdbType: 'movie' as const,
        title: 'Inception',
        year: 2010,
        posterPath: '/path/to/poster.jpg',
        backdropPath: '/path/to/backdrop.jpg',
        overview: 'A thief who steals corporate secrets...',
        confidence: 0.98,
      };

      const result = tmdbMatchCandidateSchema.parse(candidate);
      expect(result.tmdbId).toBe(27205);
      expect(result.confidence).toBe(0.98);
    });

    it('validates minimal match candidate', () => {
      const candidate = {
        tmdbId: 27205,
        tmdbType: 'tv' as const,
        title: 'Inception',
        year: null,
        posterPath: null,
        confidence: 0.5,
      };

      const result = tmdbMatchCandidateSchema.parse(candidate);
      expect(result.tmdbType).toBe('tv');
      expect(result.year).toBeNull();
    });

    it('rejects invalid TMDB types', () => {
      const candidate = {
        tmdbId: 27205,
        tmdbType: 'book',
        title: 'Inception',
        year: 2010,
        posterPath: null,
        confidence: 0.98,
      };

      expect(() => tmdbMatchCandidateSchema.parse(candidate)).toThrow();
    });

    it('rejects confidence scores outside 0-1 range', () => {
      const candidate = {
        tmdbId: 27205,
        tmdbType: 'movie' as const,
        title: 'Inception',
        year: 2010,
        posterPath: null,
        confidence: 1.5,
      };

      expect(() => tmdbMatchCandidateSchema.parse(candidate)).toThrow();
    });
  });

  describe('normalizedPreviewItemSchema', () => {
    it('validates a complete preview item', () => {
      const preview = {
        originalTitle: 'Inception',
        originalYear: 2010,
        matchCandidates: [
          {
            tmdbId: 27205,
            tmdbType: 'movie' as const,
            title: 'Inception',
            year: 2010,
            posterPath: '/poster.jpg',
            confidence: 0.98,
          },
        ],
        selectedMatchIndex: 0,
        suggestedStatus: 'completed' as const,
        rating: 9,
        notes: 'Amazing movie!',
        dateAdded: '2024-01-15T00:00:00.000Z',
        streamingProviders: ['netflix'],
        hasExistingEntry: true,
        existingEntryId: 'clx123456789',
        shouldSkip: false,
        error: null,
      };

      const result = normalizedPreviewItemSchema.parse(preview);
      expect(result.originalTitle).toBe('Inception');
      expect(result.matchCandidates).toHaveLength(1);
      expect(result.hasExistingEntry).toBe(true);
    });

    it('applies defaults for optional fields', () => {
      const minimal = {
        originalTitle: 'Inception',
        originalYear: 2010,
      };

      const result = normalizedPreviewItemSchema.parse(minimal);
      expect(result.matchCandidates).toEqual([]);
      expect(result.suggestedStatus).toBe('not_watched');
      expect(result.streamingProviders).toEqual([]);
      expect(result.hasExistingEntry).toBe(false);
      expect(result.shouldSkip).toBe(false);
    });

    it('validates preview item with error', () => {
      const errorItem = {
        originalTitle: 'Unknown Movie',
        originalYear: null,
        shouldSkip: true,
        error: 'Could not find match in TMDB',
      };

      const result = normalizedPreviewItemSchema.parse(errorItem);
      expect(result.shouldSkip).toBe(true);
      expect(result.error).toBe('Could not find match in TMDB');
    });

    it('validates multiple match candidates', () => {
      const preview = {
        originalTitle: 'The Matrix',
        originalYear: 1999,
        matchCandidates: [
          {
            tmdbId: 603,
            tmdbType: 'movie' as const,
            title: 'The Matrix',
            year: 1999,
            posterPath: '/poster1.jpg',
            confidence: 0.98,
          },
          {
            tmdbId: 604,
            tmdbType: 'movie' as const,
            title: 'The Matrix Reloaded',
            year: 2003,
            posterPath: '/poster2.jpg',
            confidence: 0.5,
          },
        ],
      };

      const result = normalizedPreviewItemSchema.parse(preview);
      expect(result.matchCandidates).toHaveLength(2);
      expect(result.matchCandidates[0].confidence).toBe(0.98);
    });
  });

  describe('duplicateResolutionSchema', () => {
    it('validates skip resolution', () => {
      const resolution = {
        itemIndex: 0,
        strategy: 'skip' as const,
      };

      const result = duplicateResolutionSchema.parse(resolution);
      expect(result.strategy).toBe('skip');
      expect(result.mergeFields).toBeUndefined();
    });

    it('validates overwrite resolution', () => {
      const resolution = {
        itemIndex: 1,
        strategy: 'overwrite' as const,
      };

      const result = duplicateResolutionSchema.parse(resolution);
      expect(result.strategy).toBe('overwrite');
    });

    it('validates merge resolution with fields', () => {
      const resolution = {
        itemIndex: 2,
        strategy: 'merge' as const,
        mergeFields: {
          status: true,
          rating: true,
          notes: 'append' as const,
          streamingProviders: 'merge' as const,
        },
      };

      const result = duplicateResolutionSchema.parse(resolution);
      expect(result.strategy).toBe('merge');
      expect(result.mergeFields?.status).toBe(true);
      expect(result.mergeFields?.notes).toBe('append');
    });

    it('applies merge field defaults', () => {
      const resolution = {
        itemIndex: 2,
        strategy: 'merge' as const,
        mergeFields: {},
      };

      const result = duplicateResolutionSchema.parse(resolution);
      expect(result.mergeFields?.status).toBe(false);
      expect(result.mergeFields?.rating).toBe(false);
      expect(result.mergeFields?.notes).toBe('keep');
      expect(result.mergeFields?.streamingProviders).toBe('keep');
    });
  });

  describe('bulkImportRequestSchema', () => {
    it('validates a complete bulk import request', () => {
      const request = {
        items: [
          {
            originalTitle: 'Inception',
            originalYear: 2010,
            matchCandidates: [
              {
                tmdbId: 27205,
                tmdbType: 'movie' as const,
                title: 'Inception',
                year: 2010,
                posterPath: '/poster.jpg',
                confidence: 0.98,
              },
            ],
            selectedMatchIndex: 0,
            suggestedStatus: 'completed' as const,
            rating: 9,
          },
        ],
        resolutions: [
          {
            itemIndex: 0,
            strategy: 'skip' as const,
          },
        ],
        skipUnmatched: true,
        defaultDuplicateStrategy: 'merge' as const,
      };

      const result = bulkImportRequestSchema.parse(request);
      expect(result.items).toHaveLength(1);
      expect(result.resolutions).toHaveLength(1);
      expect(result.skipUnmatched).toBe(true);
    });

    it('applies defaults for optional fields', () => {
      const minimal = {
        items: [
          {
            originalTitle: 'Inception',
            originalYear: 2010,
          },
        ],
      };

      const result = bulkImportRequestSchema.parse(minimal);
      expect(result.resolutions).toEqual([]);
      expect(result.skipUnmatched).toBe(false);
      expect(result.defaultDuplicateStrategy).toBe('skip');
    });
  });

  describe('importResultSchema', () => {
    it('validates a successful import result', () => {
      const result = {
        imported: 10,
        skipped: 2,
        failed: 1,
        merged: 3,
        overwritten: 1,
        errors: [
          {
            itemIndex: 5,
            title: 'Unknown Movie',
            error: 'Could not find TMDB match',
          },
        ],
      };

      const parsed = importResultSchema.parse(result);
      expect(parsed.imported).toBe(10);
      expect(parsed.errors).toHaveLength(1);
    });

    it('applies default for errors array', () => {
      const result = {
        imported: 10,
        skipped: 0,
        failed: 0,
        merged: 0,
        overwritten: 0,
      };

      const parsed = importResultSchema.parse(result);
      expect(parsed.errors).toEqual([]);
    });

    it('rejects negative counts', () => {
      const result = {
        imported: -1,
        skipped: 0,
        failed: 0,
        merged: 0,
        overwritten: 0,
      };

      expect(() => importResultSchema.parse(result)).toThrow();
    });
  });

  describe('exportedWatchlistEntrySchema', () => {
    it('validates a complete exported entry', () => {
      const entry = {
        title: 'Inception',
        year: 2010,
        type: 'movie' as const,
        status: 'completed' as const,
        rating: 9,
        notes: 'Amazing movie!',
        dateAdded: '2024-01-15T00:00:00.000Z',
        dateWatched: '2024-01-20T00:00:00.000Z',
        streamingProviders: ['netflix'],
        tmdbId: 27205,
        posterPath: '/poster.jpg',
      };

      const result = exportedWatchlistEntrySchema.parse(entry);
      expect(result.title).toBe('Inception');
      expect(result.type).toBe('movie');
      expect(result.tmdbId).toBe(27205);
    });

    it('validates minimal exported entry', () => {
      const entry = {
        title: 'The Matrix',
        year: null,
        type: 'movie' as const,
        status: 'not_watched' as const,
        rating: null,
        notes: null,
        dateAdded: '2024-01-15T00:00:00.000Z',
        dateWatched: null,
      };

      const result = exportedWatchlistEntrySchema.parse(entry);
      expect(result.streamingProviders).toEqual([]);
    });

    it('validates TV show entry', () => {
      const entry = {
        title: 'Breaking Bad',
        year: 2008,
        type: 'tv' as const,
        status: 'watching' as const,
        rating: 10,
        notes: 'Best show ever',
        dateAdded: '2024-01-01T00:00:00.000Z',
      };

      const result = exportedWatchlistEntrySchema.parse(entry);
      expect(result.type).toBe('tv');
    });
  });

  describe('exportResponseSchema', () => {
    it('validates a complete export response', () => {
      const response = {
        exportedAt: '2024-01-15T12:00:00.000Z',
        userId: 'clx123456789',
        version: '1.0',
        totalEntries: 2,
        entries: [
          {
            title: 'Inception',
            year: 2010,
            type: 'movie' as const,
            status: 'completed' as const,
            rating: 9,
            notes: null,
            dateAdded: '2024-01-15T00:00:00.000Z',
            dateWatched: null,
            streamingProviders: ['netflix'],
            tmdbId: 27205,
          },
          {
            title: 'Breaking Bad',
            year: 2008,
            type: 'tv' as const,
            status: 'watching' as const,
            rating: 10,
            notes: 'Best show',
            dateAdded: '2024-01-01T00:00:00.000Z',
            dateWatched: null,
            streamingProviders: ['netflix'],
          },
        ],
      };

      const result = exportResponseSchema.parse(response);
      expect(result.totalEntries).toBe(2);
      expect(result.entries).toHaveLength(2);
    });

    it('applies version default', () => {
      const response = {
        exportedAt: '2024-01-15T12:00:00.000Z',
        userId: 'clx123456789',
        totalEntries: 0,
        entries: [],
      };

      const result = exportResponseSchema.parse(response);
      expect(result.version).toBe('1.0');
    });
  });

  describe('JSON payload validation', () => {
    it('validates complete JSON import payload', () => {
      const jsonPayload = {
        items: [
          {
            originalTitle: 'Inception',
            originalYear: 2010,
            matchCandidates: [
              {
                tmdbId: 27205,
                tmdbType: 'movie',
                title: 'Inception',
                year: 2010,
                posterPath: '/poster.jpg',
                confidence: 0.98,
              },
            ],
            selectedMatchIndex: 0,
            suggestedStatus: 'completed',
            rating: 9,
            notes: 'Great film',
            hasExistingEntry: false,
          },
          {
            originalTitle: 'The Matrix',
            originalYear: 1999,
            matchCandidates: [],
            shouldSkip: true,
            error: 'No TMDB match found',
          },
        ],
        resolutions: [],
        skipUnmatched: true,
        defaultDuplicateStrategy: 'skip',
      };

      const result = bulkImportRequestSchema.parse(jsonPayload);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].selectedMatchIndex).toBe(0);
      expect(result.items[1].shouldSkip).toBe(true);
    });
  });
});
