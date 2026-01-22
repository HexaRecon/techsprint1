import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(morgan('dev'));

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Placeholders for modules
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import deploymentRoutes from './modules/deployments/deployments.routes.js';
import webhookRoutes from './modules/webhooks/webhooks.routes.js';

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/deployments', deploymentRoutes);
app.use('/webhooks', webhookRoutes);

app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
});
