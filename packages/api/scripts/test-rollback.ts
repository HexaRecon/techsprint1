import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js'; // Ensure this points to correct env file or verify loading

const prisma = new PrismaClient();

async function testRollback() {
    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    // 2. Get a deployment (the one we verified)
    const deployment = await prisma.deployment.findFirst({
        where: { project: { userId: user.id }, status: 'RUNNING' },
        orderBy: { createdAt: 'desc' }
    });

    if (!deployment) throw new Error('No running deployment found to rollback to');

    console.log(`Rolling back to deployment ${deployment.id} (${deployment.commitHash})`);

    // 3. Generate Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-jwt-secret');

    // 4. Call Rollback API
    const response = await fetch(`http://localhost:3001/deployments/${deployment.id}/rollback`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    console.log('Status:', response.status);
    const body = await response.json();
    console.log('Body:', body);

    if (response.status === 200) {
        console.log('Rollback triggered successfully');
    }
}

testRollback()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
