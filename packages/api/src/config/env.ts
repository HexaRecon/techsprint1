import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001'),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().default('supersecret_dev_key'),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
