import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

import { BuilderService } from './builder.service.js';
import { SwarmService } from './swarm.service.js';

const connectionConfig = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
};

console.log('Starting Build Worker...');

const builderService = new BuilderService();
const swarmService = new SwarmService();
const REGISTRY_URL = 'localhost:5000'; // Local registry from docker-compose

const worker = new Worker('build-queue', async (job) => {
    console.log(`Processing job ${job.id} for deployment ${job.data.deploymentId}`);

    const { deploymentId, gitRepository, branch, commitHash, projectName, skipBuild } = job.data;
    // NOTE: We need projectName passed in job data now.

    const buildId = `${deploymentId}-${Date.now()}`;
    const imageName = `${REGISTRY_URL}/${projectName}:${commitHash}`;

    // Simulation of build steps
    await updateDeploymentStatus(deploymentId, 'BUILDING');

    try {
        if (!skipBuild) {
            // 1. Clone
            const buildPath = await builderService.cloneRepository(gitRepository, branch, buildId);

            // 2. Build
            await builderService.buildImage(buildPath, imageName);

            // 3. Push
            await builderService.pushImage(imageName);

            // 4. Cleanup Workspace
            await builderService.cleanup(buildId);
        } else {
            console.log(`Skipping build for deployment ${deploymentId} (Rollback/Redeploy)`);
        }

        // 5. Deploy to Swarm
        // TODO: Fetch Env Vars from DB or Job Data
        await swarmService.createOrUpdateService(projectName, imageName, {});

        await updateDeploymentStatus(deploymentId, 'RUNNING');
        console.log(`Job ${job.id} completed successfully.`);
    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        await updateDeploymentStatus(deploymentId, 'FAILED');
        // Try cleanup even on fail
        try { await builderService.cleanup(buildId); } catch { }
        throw error;
    }

}, { connection: connectionConfig });

worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
});

// Helper to update status via API (or direct DB access if we share prisma)
// For microservices, usually we use API or a separate queue for status updates.
// For MVP Monorepo, we can direct DB access if we import Prisma, 
// OR call the API. Calling API is cleaner for service isolation.
// BUT calling API requires authentication (service account).
// Let's use direct DB access for MVP since it's a monorepo and shares `packages/db` (conceptually)
// Actually, let's just mock it for now or use fetch to API.

async function updateDeploymentStatus(deploymentId: string, status: string) {
    try {
        await fetch(`http://localhost:3001/deployments/${deploymentId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-builder-secret': process.env.BUILDER_SECRET || 'dev-builder-secret'
            },
            body: JSON.stringify({ status })
        });
        console.log(`Updated Deployment ${deploymentId} to ${status}`);
    } catch (e) {
        console.error(`Failed to update status for ${deploymentId}`, e);
    }
}
