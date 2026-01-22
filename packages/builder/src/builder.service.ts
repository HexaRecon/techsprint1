import simpleGit from 'simple-git';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

export class BuilderService {
    private workspaceRoot: string;

    constructor() {
        this.workspaceRoot = path.resolve(process.cwd(), 'workspace');
        fs.ensureDirSync(this.workspaceRoot);
    }

    async cloneRepository(gitRepository: string, branch: string, buildId: string): Promise<string> {
        const buildPath = path.join(this.workspaceRoot, buildId);
        await fs.ensureDir(buildPath);

        console.log(`Cloning ${gitRepository}#${branch} to ${buildPath}...`);
        const git = simpleGit();

        // For public repos, this is fine. For private, we'd need auth.
        // Assuming public or SSH configured environment for now as per MVP.
        await git.clone(gitRepository, buildPath, ['--branch', branch, '--depth', '1']);

        return buildPath;
    }

    async buildImage(buildPath: string, imageName: string): Promise<void> {
        console.log(`Building image ${imageName} from ${buildPath}...`);

        // Check if Dockerfile exists
        const dockerfilePath = path.join(buildPath, 'Dockerfile');
        if (!fs.existsSync(dockerfilePath)) {
            // TODO: Implement Nixpacks or Auto-detection here later.
            // For now, throw error if no Dockerfile.
            throw new Error('No Dockerfile found');
        }

        try {
            await execa('docker', ['build', '-t', imageName, '.'], {
                cwd: buildPath,
                stdio: 'inherit'
            });
        } catch (e: any) {
            throw new Error(`Docker build failed: ${e.message}`);
        }
    }

    async pushImage(imageName: string): Promise<void> {
        console.log(`Pushing image ${imageName}...`);
        try {
            await execa('docker', ['push', imageName], { stdio: 'inherit' });
        } catch (e: any) {
            throw new Error(`Docker push failed: ${e.message}`);
        }
    }

    async cleanup(buildId: string): Promise<void> {
        const buildPath = path.join(this.workspaceRoot, buildId);
        try {
            await fs.remove(buildPath);
        } catch (e) {
            console.error(`Failed to cleanup ${buildPath}`);
        }
    }
}
