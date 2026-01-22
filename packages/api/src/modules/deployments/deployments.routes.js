import { Router } from 'express';
import { prisma } from '../../index.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { Queue } from 'bullmq';
// Create a queue instance (ensure Redis is running)
const buildQueue = new Queue('build-queue', {
    connection: {
        host: 'localhost', // in docker-compose this might be 'redis'
        port: 6379,
    },
});
const router = Router();
router.post('/:projectId/trigger', authenticate, async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;
    // 1. Verify ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
    });
    if (!project)
        return res.status(404).json({ error: 'Project not found' });
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
    });
    res.json(deployment);
});
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    // Check generic access via project
    const deployment = await prisma.deployment.findFirst({
        where: { id, project: { userId } },
        include: { project: true },
    });
    if (!deployment)
        return res.status(404).json({ error: 'Deployment not found' });
    res.json(deployment);
});
export default router;
//# sourceMappingURL=deployments.routes.js.map