"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaItemSchema = exports.mediaTypeSchema = void 0;
const zod_1 = require("zod");
exports.mediaTypeSchema = zod_1.z.enum(['movie', 'tv']);
exports.mediaItemSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tmdbId: zod_1.z.number().int().nonnegative(),
    type: exports.mediaTypeSchema,
    title: zod_1.z.string().min(1),
    overview: zod_1.z.string().nullable(),
    releaseDate: zod_1.z.string().datetime({ offset: true }).nullable(),
    posterPath: zod_1.z.string().url().nullable(),
    backdropPath: zod_1.z.string().url().nullable(),
    createdAt: zod_1.z.string().datetime({ offset: true }),
    updatedAt: zod_1.z.string().datetime({ offset: true }),
});
//# sourceMappingURL=media.js.map