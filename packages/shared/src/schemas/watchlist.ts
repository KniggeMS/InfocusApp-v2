import { z } from 'zod';

export const watchStatusSchema = z.enum(['not_watched', 'watching', 'completed']);

export const watchlistEntrySchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  mediaItemId: z.string().cuid(),
  status: watchStatusSchema,
  rating: z.number().int().min(1).max(10).nullable(),
  notes: z.string().max(1000).nullable(),
  watchedAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type WatchlistEntrySchema = z.infer<typeof watchlistEntrySchema>;
