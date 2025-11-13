import { z } from 'zod';

export const mediaTypeSchema = z.enum(['movie', 'tv']);

export const mediaItemSchema = z.object({
  id: z.string().cuid(),
  tmdbId: z.number().int().nonnegative(),
  type: mediaTypeSchema,
  title: z.string().min(1),
  overview: z.string().nullable(),
  releaseDate: z.string().datetime({ offset: true }).nullable(),
  posterPath: z.string().url().nullable(),
  backdropPath: z.string().url().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type MediaItemSchema = z.infer<typeof mediaItemSchema>;
