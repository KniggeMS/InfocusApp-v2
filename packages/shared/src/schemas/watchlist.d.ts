import { z } from 'zod';
export declare const watchStatusSchema: z.ZodEnum<["not_watched", "watching", "completed"]>;
export declare const watchlistEntrySchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    mediaItemId: z.ZodString;
    status: z.ZodEnum<["not_watched", "watching", "completed"]>;
    rating: z.ZodNullable<z.ZodNumber>;
    notes: z.ZodNullable<z.ZodString>;
    watchedAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "not_watched" | "watching" | "completed";
    rating: number | null;
    notes: string | null;
    userId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    mediaItemId: string;
    watchedAt: string | null;
}, {
    status: "not_watched" | "watching" | "completed";
    rating: number | null;
    notes: string | null;
    userId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    mediaItemId: string;
    watchedAt: string | null;
}>;
export type WatchlistEntrySchema = z.infer<typeof watchlistEntrySchema>;
//# sourceMappingURL=watchlist.d.ts.map