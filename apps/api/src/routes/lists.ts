import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createListSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
});

const addItemSchema = z.object({
    mediaItemId: z.string().min(1, 'Media Item ID is required'),
});

// GET /lists - Get user's lists
router.get('/', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const lists = await prisma.customList.findMany({
            where: { userId: req.user.id },
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(lists);
    } catch (error) {
        next(error);
    }
});

// POST /lists - Create new list
router.post('/', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const validatedData = createListSchema.parse(req.body);

        const list = await prisma.customList.create({
            data: {
                ...validatedData,
                userId: req.user.id,
            },
        });

        res.status(201).json(list);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
});

// GET /lists/:id - Get list details with items
router.get('/:id', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const list = await prisma.customList.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        mediaItem: true,
                    },
                    orderBy: { addedAt: 'desc' },
                },
            },
        });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Check ownership or public visibility
        if (list.userId !== req.user.id && !list.isPublic) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(list);
    } catch (error) {
        next(error);
    }
});

// DELETE /lists/:id - Delete list
router.delete('/:id', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const list = await prisma.customList.findUnique({
            where: { id: req.params.id },
        });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        if (list.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.customList.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// POST /lists/:id/items - Add item to list
router.post('/:id/items', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const { mediaItemId } = addItemSchema.parse(req.body);
        const listId = req.params.id;

        const list = await prisma.customList.findUnique({
            where: { id: listId },
        });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        if (list.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if item already exists in list
        const existingEntry = await prisma.customListEntry.findUnique({
            where: {
                listId_mediaItemId: {
                    listId,
                    mediaItemId,
                },
            },
        });

        if (existingEntry) {
            return res.status(409).json({ error: 'Item already in list' });
        }

        const entry = await prisma.customListEntry.create({
            data: {
                listId,
                mediaItemId,
            },
            include: {
                mediaItem: true,
            },
        });

        res.status(201).json(entry);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
});

// DELETE /lists/:id/items/:mediaItemId - Remove item from list
router.delete('/:id/items/:mediaItemId', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const { id: listId, mediaItemId } = req.params;

        const list = await prisma.customList.findUnique({
            where: { id: listId },
        });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        if (list.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.customListEntry.delete({
            where: {
                listId_mediaItemId: {
                    listId,
                    mediaItemId,
                },
            },
        });

        res.json({ message: 'Item removed from list' });
    } catch (error) {
        // Handle "Record to delete does not exist" error
        if ((error as any).code === 'P2025') {
            return res.status(404).json({ error: 'Item not found in list' });
        }
        next(error);
    }
});

export { router as listsRouter };
