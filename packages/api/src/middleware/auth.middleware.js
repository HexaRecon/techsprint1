import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../index.js';
export const authenticate = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = header.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        req.user = {
            id: payload.userId,
            githubId: payload.githubId,
            role: 'OWNER', // Default for now
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
//# sourceMappingURL=auth.middleware.js.map