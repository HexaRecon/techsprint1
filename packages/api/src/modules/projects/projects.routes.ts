import { Router, type Request, type Response } from 'express';
import { prisma } from '../../index.js';
import { authenticate, type AuthRequest } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    const { name, gitRepository, branch } = req.body;
    const userId = req.user!.id;

    try {
        const project = await prisma.project.create({
            data: {
                name,
                gitRepository,
                branch: branch || 'main',
                userId,
            },
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const projects = await prisma.project.findMany({
        where: { userId },
        include: { deployments: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
    res.json(projects);
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findFirst({
        where: { id, userId },
        include: { deployments: { take: 10, orderBy: { createdAt: 'desc' } } },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json(project);
});

export default router;
