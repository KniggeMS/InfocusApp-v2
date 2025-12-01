import { z } from 'zod';
export declare const mediaTypeSchema: z.ZodEnum<["movie", "tv"]>;
export declare const mediaItemSchema: z.ZodObject<{
    id: z.ZodString;
    tmdbId: z.ZodNumber;
    type: z.ZodEnum<["movie", "tv"]>;
    title: z.ZodString;
    overview: z.ZodNullable<z.ZodString>;
    releaseDate: z.ZodNullable<z.ZodString>;
    posterPath: z.ZodNullable<z.ZodString>;
    backdropPath: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    type: "movie" | "tv";
    tmdbId: number;
    posterPath: string | null;
    backdropPath: string | null;
    overview: string | null;
    id: string;
    releaseDate: string | null;
    createdAt: string;
    updatedAt: string;
}, {
    title: string;
    type: "movie" | "tv";
    tmdbId: number;
    posterPath: string | null;
    backdropPath: string | null;
    overview: string | null;
    id: string;
    releaseDate: string | null;
    createdAt: string;
    updatedAt: string;
}>;
export type MediaItemSchema = z.infer<typeof mediaItemSchema>;
//# sourceMappingURL=media.d.ts.map