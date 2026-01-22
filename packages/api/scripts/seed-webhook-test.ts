import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    // Create a user first
    let user = await prisma.user.findFirst({ where: { email: 'test@example.com' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                username: 'testuser',
                githubId: '12345',
                avatarUrl: 'https://example.com/avatar',
                role: 'OWNER'
            }
        });
    }

    // Create a project matching the webhook
    const repoUrl = '/home/hexarecon/Desktop/docker/test-repo';
    const existingProject = await prisma.project.findFirst({ where: { gitRepository: repoUrl } });

    if (!existingProject) {
        await prisma.project.create({
            data: {
                name: 'local-test-app',
                gitRepository: repoUrl,
                branch: 'main',
                userId: user.id
            }
        });
        console.log('Seeded project');
    } else {
        console.log('Project already exists');
    }
}

seed()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
