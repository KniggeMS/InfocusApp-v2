// This file is used to verify that all exports are correctly set up
// It should not be included in the build

import type {
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
} from './types';

import {
  rawWatchlistRowSchema,
  tmdbMatchCandidateSchema,
  normalizedPreviewItemSchema,
  duplicateResolutionStrategySchema,
  mergeFieldsSchema,
  duplicateResolutionSchema,
  bulkImportRequestSchema,
  importResultSchema,
  exportedWatchlistEntrySchema,
  exportResponseSchema,
} from './schemas';

import {
  normalizeWatchStatus,
  parseStreamingProviders,
  normalizeDateString,
  calculateMatchConfidence,
  normalizeRating,
} from './utils';

// Type assertions to ensure imports work
const _rawRow: RawWatchlistRow = {} as any;
const _match: TmdbMatchCandidate = {} as any;
const _preview: NormalizedPreviewItem = {} as any;
const _strategy: DuplicateResolutionStrategy = 'skip';
const _mergeFields: MergeFields = {} as any;
const _resolution: DuplicateResolution = {} as any;
const _bulkRequest: BulkImportRequest = {} as any;
const _importResult: ImportResult = {} as any;
const _exportedEntry: ExportedWatchlistEntry = {} as any;
const _exportResponse: ExportResponse = {} as any;

// Schema assertions
const _schemas = [
  rawWatchlistRowSchema,
  tmdbMatchCandidateSchema,
  normalizedPreviewItemSchema,
  duplicateResolutionStrategySchema,
  mergeFieldsSchema,
  duplicateResolutionSchema,
  bulkImportRequestSchema,
  importResultSchema,
  exportedWatchlistEntrySchema,
  exportResponseSchema,
];

// Utility assertions
const _utils = [
  normalizeWatchStatus,
  parseStreamingProviders,
  normalizeDateString,
  calculateMatchConfidence,
  normalizeRating,
];

console.log('All exports verified:', {
  types: [
    _rawRow,
    _match,
    _preview,
    _strategy,
    _mergeFields,
    _resolution,
    _bulkRequest,
    _importResult,
    _exportedEntry,
    _exportResponse,
  ],
  schemas: _schemas.length,
  utils: _utils.length,
});
