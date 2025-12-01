"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchlistEntrySchema = exports.watchStatusSchema = void 0;
const zod_1 = require("zod");
exports.watchStatusSchema = zod_1.z.enum(['not_watched', 'watching', 'completed']);
exports.watchlistEntrySchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    userId: zod_1.z.string().cuid(),
    mediaItemId: zod_1.z.string().cuid(),
    status: exports.watchStatusSchema,
    rating: zod_1.z.number().int().min(1).max(10).nullable(),
    notes: zod_1.z.string().max(1000).nullable(),
    watchedAt: zod_1.z.string().datetime({ offset: true }).nullable(),
    createdAt: zod_1.z.string().datetime({ offset: true }),
    updatedAt: zod_1.z.string().datetime({ offset: true }),
});
//# sourceMappingURL=watchlist.js.map