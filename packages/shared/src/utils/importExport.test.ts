import {
  normalizeWatchStatus,
  parseStreamingProviders,
  normalizeDateString,
  calculateMatchConfidence,
  normalizeRating,
} from './importExport';

describe('Import/Export Utilities', () => {
  describe('normalizeWatchStatus', () => {
    it('normalizes "completed" variations', () => {
      expect(normalizeWatchStatus('completed')).toBe('completed');
      expect(normalizeWatchStatus('Completed')).toBe('completed');
      expect(normalizeWatchStatus('watched')).toBe('completed');
      expect(normalizeWatchStatus('Watched')).toBe('completed');
      expect(normalizeWatchStatus('done')).toBe('completed');
      expect(normalizeWatchStatus('finished')).toBe('completed');
      expect(normalizeWatchStatus('COMPLETE')).toBe('completed');
      expect(normalizeWatchStatus('saw')).toBe('completed');
      expect(normalizeWatchStatus('seen')).toBe('completed');
    });

    it('normalizes "watching" variations', () => {
      expect(normalizeWatchStatus('watching')).toBe('watching');
      expect(normalizeWatchStatus('Watching')).toBe('watching');
      expect(normalizeWatchStatus('in progress')).toBe('watching');
      expect(normalizeWatchStatus('in-progress')).toBe('watching');
      expect(normalizeWatchStatus('started')).toBe('watching');
      expect(normalizeWatchStatus('currently watching')).toBe('watching');
      expect(normalizeWatchStatus('ongoing')).toBe('watching');
    });

    it('normalizes "not_watched" variations', () => {
      expect(normalizeWatchStatus('not watched')).toBe('not_watched');
      expect(normalizeWatchStatus('not_watched')).toBe('not_watched');
      expect(normalizeWatchStatus('unwatched')).toBe('not_watched');
      expect(normalizeWatchStatus('to watch')).toBe('not_watched');
      expect(normalizeWatchStatus('plan to watch')).toBe('not_watched');
      expect(normalizeWatchStatus('want to watch')).toBe('not_watched');
      expect(normalizeWatchStatus('planned')).toBe('not_watched');
      expect(normalizeWatchStatus('ptw')).toBe('not_watched');
      expect(normalizeWatchStatus('backlog')).toBe('not_watched');
    });

    it('defaults to "not_watched" for unknown statuses', () => {
      expect(normalizeWatchStatus('unknown')).toBe('not_watched');
      expect(normalizeWatchStatus('random')).toBe('not_watched');
      expect(normalizeWatchStatus('')).toBe('not_watched');
    });

    it('handles null and undefined', () => {
      expect(normalizeWatchStatus(null)).toBe('not_watched');
      expect(normalizeWatchStatus(undefined)).toBe('not_watched');
    });

    it('handles whitespace', () => {
      expect(normalizeWatchStatus('  completed  ')).toBe('completed');
      expect(normalizeWatchStatus('  watching  ')).toBe('watching');
    });
  });

  describe('parseStreamingProviders', () => {
    it('parses array of strings', () => {
      expect(parseStreamingProviders(['Netflix', 'Hulu'])).toEqual([
        'netflix',
        'hulu',
      ]);
      expect(parseStreamingProviders(['NETFLIX', 'HULU', 'Prime'])).toEqual([
        'netflix',
        'hulu',
        'prime',
      ]);
    });

    it('parses comma-separated strings', () => {
      expect(parseStreamingProviders('Netflix, Hulu')).toEqual([
        'netflix',
        'hulu',
      ]);
      expect(parseStreamingProviders('Netflix,Hulu,Prime')).toEqual([
        'netflix',
        'hulu',
        'prime',
      ]);
    });

    it('parses semicolon-separated strings', () => {
      expect(parseStreamingProviders('Netflix; Hulu; Prime')).toEqual([
        'netflix',
        'hulu',
        'prime',
      ]);
    });

    it('parses pipe-separated strings', () => {
      expect(parseStreamingProviders('Netflix | Hulu | Prime')).toEqual([
        'netflix',
        'hulu',
        'prime',
      ]);
    });

    it('parses JSON array strings', () => {
      expect(parseStreamingProviders('["Netflix", "Hulu"]')).toEqual([
        'netflix',
        'hulu',
      ]);
      expect(parseStreamingProviders('["NETFLIX","HULU","Prime"]')).toEqual([
        'netflix',
        'hulu',
        'prime',
      ]);
    });

    it('parses single provider strings', () => {
      expect(parseStreamingProviders('Netflix')).toEqual(['netflix']);
      expect(parseStreamingProviders('HULU')).toEqual(['hulu']);
    });

    it('handles null and undefined', () => {
      expect(parseStreamingProviders(null)).toEqual([]);
      expect(parseStreamingProviders(undefined)).toEqual([]);
    });

    it('handles empty strings and arrays', () => {
      expect(parseStreamingProviders('')).toEqual([]);
      expect(parseStreamingProviders([])).toEqual([]);
    });

    it('filters out empty strings', () => {
      expect(parseStreamingProviders(['Netflix', '', 'Hulu'])).toEqual([
        'netflix',
        'hulu',
      ]);
      expect(parseStreamingProviders('Netflix, , Hulu')).toEqual([
        'netflix',
        'hulu',
      ]);
    });

    it('trims whitespace from provider names', () => {
      expect(parseStreamingProviders('  Netflix  , Hulu  ')).toEqual([
        'netflix',
        'hulu',
      ]);
      expect(parseStreamingProviders(['  Netflix  ', '  Hulu  '])).toEqual([
        'netflix',
        'hulu',
      ]);
    });

    it('handles malformed JSON gracefully', () => {
      // Should fall back to CSV parsing
      expect(parseStreamingProviders('[Netflix, Hulu]')).toEqual([
        '[netflix',
        'hulu]',
      ]);
    });
  });

  describe('normalizeDateString', () => {
    it('normalizes ISO date strings', () => {
      const result = normalizeDateString('2024-01-15T00:00:00.000Z');
      expect(result).toBe('2024-01-15T00:00:00.000Z');
    });

    it('normalizes date-only strings', () => {
      const result = normalizeDateString('2024-01-15');
      expect(result).toMatch(/2024-01-15/);
    });

    it('normalizes US date format (MM/DD/YYYY)', () => {
      const result = normalizeDateString('01/15/2024');
      expect(result).toMatch(/2024-01-15/);
    });

    it('normalizes EU date format (DD.MM.YYYY)', () => {
      const result = normalizeDateString('15.01.2024');
      expect(result).toMatch(/2024-01-15/);
    });

    it('normalizes EU date format (DD/MM/YYYY)', () => {
      const result = normalizeDateString('15/01/2024');
      expect(result).toMatch(/2024-01-15/);
    });

    it('handles Date objects', () => {
      const date = new Date('2024-01-15T00:00:00.000Z');
      const result = normalizeDateString(date);
      expect(result).toBe('2024-01-15T00:00:00.000Z');
    });

    it('handles timestamps', () => {
      const timestamp = new Date('2024-01-15T00:00:00.000Z').getTime();
      const result = normalizeDateString(timestamp);
      expect(result).toMatch(/2024-01-15/);
    });

    it('handles null and undefined', () => {
      expect(normalizeDateString(null)).toBeNull();
      expect(normalizeDateString(undefined)).toBeNull();
    });

    it('returns null for invalid dates', () => {
      expect(normalizeDateString('invalid')).toBeNull();
      expect(normalizeDateString('not-a-date')).toBeNull();
    });

    it('handles single-digit dates', () => {
      const result = normalizeDateString('1/5/2024');
      expect(result).toMatch(/2024-01-05/);
    });
  });

  describe('calculateMatchConfidence', () => {
    it('returns 1.0 for perfect match with poster', () => {
      const confidence = calculateMatchConfidence(
        'Inception',
        2010,
        'Inception',
        2010,
        true
      );
      expect(confidence).toBe(1.0);
    });

    it('returns high confidence for exact title and year match', () => {
      const confidence = calculateMatchConfidence(
        'Inception',
        2010,
        'Inception',
        2010,
        false
      );
      expect(confidence).toBeGreaterThan(0.9);
    });

    it('reduces confidence when year is off by 1', () => {
      const confidence = calculateMatchConfidence(
        'Inception',
        2011,
        'Inception',
        2010,
        true
      );
      expect(confidence).toBeGreaterThan(0.65);
      expect(confidence).toBeLessThan(1.0);
    });

    it('reduces confidence when year is missing', () => {
      const confidence = calculateMatchConfidence(
        'Inception',
        2010,
        'Inception',
        null,
        true
      );
      expect(confidence).toBeGreaterThan(0.65);
      expect(confidence).toBeLessThan(0.85);
    });

    it('handles partial title matches', () => {
      const confidence = calculateMatchConfidence(
        'The Matrix',
        1999,
        'Matrix',
        1999,
        true
      );
      expect(confidence).toBeGreaterThan(0.7);
      expect(confidence).toBeLessThan(1.0);
    });

    it('returns lower confidence for poor matches', () => {
      const confidence = calculateMatchConfidence(
        'The Matrix',
        2000,
        'Matrix',
        1999,
        false
      );
      expect(confidence).toBeLessThan(0.7);
    });

    it('handles case-insensitive matching', () => {
      const confidence = calculateMatchConfidence(
        'INCEPTION',
        2010,
        'inception',
        2010,
        true
      );
      expect(confidence).toBe(1.0);
    });

    it('handles titles with special characters', () => {
      const confidence = calculateMatchConfidence(
        "Ocean's Eleven",
        2001,
        'Oceans Eleven',
        2001,
        true
      );
      expect(confidence).toBe(1.0);
    });

    it('awards partial credit when original year is missing', () => {
      const confidence = calculateMatchConfidence(
        'Inception',
        2010,
        'Inception',
        undefined,
        true
      );
      expect(confidence).toBeGreaterThan(0.65);
      expect(confidence).toBeLessThan(0.85);
    });

    it('handles completely different titles', () => {
      const confidence = calculateMatchConfidence(
        'Inception',
        2010,
        'The Matrix',
        1999,
        false
      );
      expect(confidence).toBeLessThan(0.3);
    });
  });

  describe('normalizeRating', () => {
    it('normalizes 10-point scale ratings', () => {
      expect(normalizeRating(7, 10)).toBe(7);
      expect(normalizeRating(10, 10)).toBe(10);
      expect(normalizeRating(0, 10)).toBe(0);
    });

    it('converts 5-star ratings to 10-point scale', () => {
      expect(normalizeRating(5, 5)).toBe(10);
      expect(normalizeRating(4, 5)).toBe(8);
      expect(normalizeRating(3, 5)).toBe(6);
      expect(normalizeRating(2.5, 5)).toBe(5);
      expect(normalizeRating(0, 5)).toBe(0);
    });

    it('converts percentage ratings to 10-point scale', () => {
      expect(normalizeRating(100, 100)).toBe(10);
      expect(normalizeRating(85, 100)).toBe(9);
      expect(normalizeRating(50, 100)).toBe(5);
      expect(normalizeRating(0, 100)).toBe(0);
    });

    it('rounds decimal values', () => {
      expect(normalizeRating(7.8, 10)).toBe(8);
      expect(normalizeRating(7.4, 10)).toBe(7);
      expect(normalizeRating(7.5, 10)).toBe(8);
    });

    it('clamps values to 0-10 range', () => {
      expect(normalizeRating(-5, 10)).toBe(0);
      expect(normalizeRating(15, 10)).toBe(10);
      expect(normalizeRating(150, 100)).toBe(10);
    });

    it('handles null and undefined', () => {
      expect(normalizeRating(null)).toBeNull();
      expect(normalizeRating(undefined)).toBeNull();
    });

    it('handles NaN', () => {
      expect(normalizeRating(NaN)).toBeNull();
    });

    it('uses default scale of 10 when not specified', () => {
      expect(normalizeRating(7)).toBe(7);
      expect(normalizeRating(10)).toBe(10);
    });

    it('handles edge cases in 5-star conversion', () => {
      expect(normalizeRating(0.5, 5)).toBe(1);
      expect(normalizeRating(4.5, 5)).toBe(9);
      expect(normalizeRating(1, 5)).toBe(2);
    });

    it('handles edge cases in percentage conversion', () => {
      expect(normalizeRating(1, 100)).toBe(0);
      expect(normalizeRating(99, 100)).toBe(10);
      expect(normalizeRating(95, 100)).toBe(10);
      expect(normalizeRating(94, 100)).toBe(9);
    });
  });

  describe('Integration scenarios', () => {
    it('handles CSV import row processing', () => {
      const csvRow = {
        title: 'Inception',
        year: '2010',
        status: 'Watched',
        rating: '9',
        providers: 'Netflix, Hulu',
        dateAdded: '01/15/2024',
      };

      const status = normalizeWatchStatus(csvRow.status);
      const rating = normalizeRating(Number(csvRow.rating));
      const providers = parseStreamingProviders(csvRow.providers);
      const dateAdded = normalizeDateString(csvRow.dateAdded);

      expect(status).toBe('completed');
      expect(rating).toBe(9);
      expect(providers).toEqual(['netflix', 'hulu']);
      expect(dateAdded).toMatch(/2024-01-15/);
    });

    it('handles JSON import payload processing', () => {
      const jsonRow = {
        title: 'Breaking Bad',
        year: 2008,
        status: 'in progress',
        rating: 10,
        providers: '["Netflix"]',
        dateAdded: '2024-01-01T00:00:00.000Z',
      };

      const status = normalizeWatchStatus(jsonRow.status);
      const rating = normalizeRating(jsonRow.rating);
      const providers = parseStreamingProviders(jsonRow.providers);
      const dateAdded = normalizeDateString(jsonRow.dateAdded);

      expect(status).toBe('watching');
      expect(rating).toBe(10);
      expect(providers).toEqual(['netflix']);
      expect(dateAdded).toBe('2024-01-01T00:00:00.000Z');
    });

    it('handles TMDB matching with confidence scoring', () => {
      const originalTitle = 'The Matrix';
      const originalYear = 1999;

      const candidate1 = {
        title: 'The Matrix',
        year: 1999,
        hasPoster: true,
      };

      const candidate2 = {
        title: 'The Matrix Reloaded',
        year: 2003,
        hasPoster: true,
      };

      const confidence1 = calculateMatchConfidence(
        candidate1.title,
        candidate1.year,
        originalTitle,
        originalYear,
        candidate1.hasPoster
      );

      const confidence2 = calculateMatchConfidence(
        candidate2.title,
        candidate2.year,
        originalTitle,
        originalYear,
        candidate2.hasPoster
      );

      expect(confidence1).toBeGreaterThan(0.9);
      expect(confidence2).toBeLessThan(confidence1);
    });

    it('handles 5-star rating import and normalization', () => {
      const rating5Star = 4.5;
      const normalized = normalizeRating(rating5Star, 5);
      expect(normalized).toBe(9);
    });
  });
});
