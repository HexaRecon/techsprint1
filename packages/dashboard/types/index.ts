export interface User {
    id: string;
    username: string;
    avatarUrl: string;
    role: 'USER' | 'ADMIN';
}

export interface Project {
    id: string;
    name: string;
    gitRepository: string;
    branch: string;
    createdAt: string;
}

export interface Deployment {
    id: string;
    status: 'QUEUED' | 'BUILDING' | 'DEPLOYING' | 'RUNNING' | 'FAILED' | 'STOPPED';
    commitHash: string;
    commitMessage?: string;
    createdAt: string;
}
