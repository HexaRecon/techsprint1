import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env.js';

// Extend Request to include rawBody if needed, but express.json({ verify: ... }) is better.
// However, since we might use standard body parser, we'll assume req.body is already parsed 
// BUT verifying signature requires the RAW body. 
// A common approach is to verify it before body-parser or use `verify` option in body-parser.

export const verifyGithubWebhook = (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-hub-signature-256'] as string;

    if (!signature) {
        return res.status(401).json({ error: 'No signature found' });
    }

    // We need the raw body here. 
    // Since we are likely using `app.use(express.json())` globally, 
    // we need to make sure we have access to the raw body.
    // One way is to attach it to the request object in the json middleware options.

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
        // If rawBody is missing, it might be a configuration issue or empty body.
        // For now, let's assume we configure express to provide it.
        return res.status(500).json({ error: 'Webhook configuration error' });
    }

    // Use a project-specific secret in a real app, 
    // but for MVP/Global webhook (like a GitHub App), we might use a global secret.
    // Or if it's per-repo, we'd need to look up the project first. 
    // THE USER REQUIREMENT: "Verify GitHub... signatures".
    // Let's assume a global webhook secret for now for simplicity, or look up based on logic.
    // But wait, if we are receiving webhooks for specific USER repos, 
    // we usually configure a webhook on the repo with a specific secret.
    // We'll use GITHUB_WEBHOOK_SECRET from env for now.

    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'dev-webhook-secret';

    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        return next();
    }

    return res.status(401).json({ error: 'Invalid signature' });
};
