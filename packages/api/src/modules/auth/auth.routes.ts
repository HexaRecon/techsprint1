import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index.js';
import { env } from '../../config/env.js';

const router = Router();

router.get('/github', (req: Request, res: Response) => {
    const redirect_uri = `http://localhost:3001/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=read:user repo`;
    res.redirect(url);
});

router.get('/github/callback', async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing code' });
    }

    try {
        // 1. Exchange code for token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = (await tokenResponse.json()) as any;
        if (!tokenData.access_token) {
            return res.status(401).json({ error: 'Failed to authenticate with GitHub' });
        }

        // 2. Get User Profile
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });
        const userData = (await userResponse.json()) as any;

        // 3. Upsert User
        let user = await prisma.user.findUnique({
            where: { githubId: String(userData.id) },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    githubId: String(userData.id),
                    username: userData.login,
                    avatarUrl: userData.avatar_url,
                    email: userData.email, // Note: might be null if private
                },
            });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { userId: user.id, githubId: user.githubId },
            env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Redirect to frontend with token
        // In a real app, might want to use a cookie or a secure intermediate page
        // For MVP, passing via query param to specific frontend route which saves it
        res.redirect(`${env.FRONTEND_URL}/login/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);

    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me', async (req: any, res: Response) => {
    // Middleware should place user in req.user
    // Check if req.user exists (authenticate middleware usage)
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ user: req.user });
});

export default router;
