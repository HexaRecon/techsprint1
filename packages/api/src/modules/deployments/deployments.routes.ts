import { Router, type Request, type Response } from 'express';
import { prisma } from '../../index.js';
import { authenticate, type AuthRequest } from '../../middleware/auth.middleware.js';
import { Queue } from 'bullmq';

// Create a queue instance (ensure Redis is running)
const buildQueue = new Queue('build-queue', {
    connection: {
        host: 'localhost', // in docker-compose this might be 'redis'
        port: 6379,
    },
});

const router = Router();

router.post('/:projectId/trigger', authenticate, async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.id;

    // 1. Verify ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // 2. Create Deployment Record
    const deployment = await prisma.deployment.create({
        data: {
            projectId,
            status: 'QUEUED',
            commitHash: 'HEAD', // In real implementation, get from git
            commitMessage: 'Manual Trigger',
        },
    });

    // 3. Add to Build Queue
    await buildQueue.add('build', {
        deploymentId: deployment.id,
        gitRepository: project.gitRepository,
        branch: project.branch,
        commitHash: 'HEAD',
        projectName: project.name
    });

    res.json(deployment);
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check generic access via project
    const deployment = await prisma.deployment.findFirst({
        where: { id, project: { userId } },
        include: { project: true },
    });

    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });

    res.json(deployment);
});

router.post('/:id/rollback', authenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // 1. Find the deployment to rollback TO
    const targetDeployment = await prisma.deployment.findFirst({
        where: { id, project: { userId } },
        include: { project: true }
    });

    if (!targetDeployment) return res.status(404).json({ error: 'Deployment not found' });

    // 2. Create New Deployment (The "Rollback" deployment)
    const rollbackDeployment = await prisma.deployment.create({
        data: {
            projectId: targetDeployment.projectId,
            status: 'QUEUED',
            commitHash: targetDeployment.commitHash,
            commitMessage: `Rollback to ${targetDeployment.id}`,
        }
    });

    // 3. Trigger Build (Skip Build)
    await buildQueue.add('build', {
        deploymentId: rollbackDeployment.id,
        gitRepository: targetDeployment.project.gitRepository,
        branch: targetDeployment.project.branch,
        commitHash: targetDeployment.commitHash,
        projectName: targetDeployment.project.name,
        skipBuild: true
    });

    res.json(rollbackDeployment);
});

// Internal endpoint for builder
router.patch('/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    // Basic security: Check for a shared secret header (MVP)
    const secret = req.headers['x-builder-secret'];
    const expectedSecret = process.env.BUILDER_SECRET || 'dev-builder-secret';

    if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const deployment = await prisma.deployment.update({
            where: { id },
            data: { status }
        });
        res.json(deployment);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

export default router;
