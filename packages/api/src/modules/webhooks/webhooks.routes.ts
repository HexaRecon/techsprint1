import { Router, type Request, type Response } from 'express';
import { prisma } from '../../index.js';
import { verifyGithubWebhook } from '../../middleware/webhook.middleware.js';
import { Queue } from 'bullmq';

const buildQueue = new Queue('build-queue', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});

const router = Router();

// Handle Push Events
router.post('/github', verifyGithubWebhook, async (req: Request, res: Response) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event === 'ping') {
        return res.json({ message: 'pong' });
    }

    if (event === 'push') {
        const repoUrl = payload.repository.html_url; // e.g. https://github.com/user/repo
        const branch = payload.ref.replace('refs/heads/', '');
        const commitHash = payload.after;
        const commitMessage = payload.head_commit?.message || 'Update';

        // Find project(s) matching this repo and branch
        // Note: In real world, we should normalize URLs (remove .git, etc)
        // and maybe match by githubId if we store it.
        // For MVP, simplistic string match.

        // We strictly search for projects that match this repository 
        // AND branch (or we could trigger for all branches if configured).
        // Let's assume exact match for now.

        // NOTE: This does require the project to be created in our DB first 
        // with the exact same gitRepository URL.

        // Also, we need to handle "repoUrl" formats. 
        // GitHub sends "https://github.com/user/repo".
        // User might have verified "github.com/user/repo". 
        // We'll do a primitive contains search or try to match both.

        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { gitRepository: payload.repository.html_url },
                    { gitRepository: { contains: payload.repository.full_name } }
                ],
                branch: branch
            }
        });

        if (projects.length === 0) {
            return res.status(200).json({ message: 'No projects configured for this repo/branch' });
        }

        for (const project of projects) {
            // Create Deployment
            const deployment = await prisma.deployment.create({
                data: {
                    projectId: project.id,
                    status: 'QUEUED',
                    commitHash,
                    commitMessage,
                }
            });

            // Trigger Build
            await buildQueue.add('build', {
                deploymentId: deployment.id,
                gitRepository: project.gitRepository, // or payload.repository.clone_url for public/token
                branch,
                commitHash,
                projectName: project.name
            });

            console.log(`Triggered build for project ${project.name} (Deployment ${deployment.id})`);
        }

        return res.json({ message: `Triggered ${projects.length} deployments` });
    }

    res.status(200).json({ message: 'Ignored event' });
});

export default router;
