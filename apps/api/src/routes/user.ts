import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { sanitizeUser } from '../utils/userHelpers';

const router: Router = Router();
const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    avatar: z.string().url('Invalid avatar URL').optional().nullable(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// PUT /user - Update profile
router.put('/', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const validatedData = updateProfileSchema.parse(req.body);
        const { name, avatar } = validatedData;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(avatar !== undefined && { avatar }), // Allow setting to null
            },
        });

        res.json({
            message: 'Profile updated successfully',
            user: sanitizeUser(user),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors,
            });
        }
        next(error);
    }
});

// POST /user/change-password
router.post('/change-password', authMiddleware, async (req: any, res: any, next: any): Promise<void> => {
    try {
        const validatedData = changePasswordSchema.parse(req.body);
        const { currentPassword, newPassword } = validatedData;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors,
            });
        }
        next(error);
    }
});

export { router as userRouter };
