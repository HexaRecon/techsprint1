import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index.js';
import { env } from '../../config/env.js';
const router = Router();
// Mock Login for Dev (Skip OAuth for now to unblock)
router.post('/login/mock', async (req, res) => {
    const { username } = req.body;
    // Find or create user
    // In real world, this would process OAuth callback
    let user = await prisma.user.findFirst({ where: { username } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                username,
                githubId: `mock_${Math.floor(Math.random() * 10000)}`,
                avatarUrl: `https://ui-avatars.com/api/?name=${username}`,
            },
        });
    }
    const token = jwt.sign({ userId: user.id, githubId: user.githubId }, env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
});
router.get('/me', async (req, res) => {
    // Middleware validation assumed
    // But we need to verify first
    // This endpoint should be protected
    res.json({ user: req.user });
});
export default router;
//# sourceMappingURL=auth.routes.js.map