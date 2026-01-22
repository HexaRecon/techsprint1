import { execa } from 'execa';

export class SwarmService {

    async createOrUpdateService(projectName: string, imageName: string, envVars: Record<string, string> = {}): Promise<void> {
        const serviceName = `app-${projectName}`;
        console.log(`Deploying service ${serviceName} with image ${imageName}...`);

        // Flatten env vars for docker command
        const envArgs = Object.entries(envVars).flatMap(([k, v]) => ['--env', `${k}=${v}`]);

        // Check if service exists
        let serviceExists = false;
        try {
            await execa('docker', ['service', 'inspect', serviceName]);
            serviceExists = true;
        } catch (e) {
            // Service does not exist
        }

        // Traefik labels
        // Assuming Traefik is running and watching Docker
        // Host rule: projectName.localhost (for local dev)
        const hostLabel = `traefik.http.routers.${projectName}.rule=Host(\`${projectName}.localhost\`)`;
        const portLabel = `traefik.http.services.${projectName}.loadbalancer.server.port=3000`; // Default to 3000 for now, or detect
        const network = 'docker_platform-network'; // Must match docker-compose network name used by Traefik

        try {
            if (serviceExists) {
                console.log(`Updating existing service ${serviceName}...`);
                await execa('docker', [
                    'service', 'update',
                    '--image', imageName,
                    '--with-registry-auth',
                    ...envArgs,
                    serviceName
                ], { stdio: 'inherit' });
            } else {
                console.log(`Creating new service ${serviceName}...`);
                await execa('docker', [
                    'service', 'create',
                    '--name', serviceName,
                    '--network', network,
                    '--label', 'traefik.enable=true',
                    '--label', hostLabel,
                    '--label', portLabel, // TODO: Make configurable
                    '--with-registry-auth',
                    ...envArgs,
                    imageName
                ], { stdio: 'inherit' });
            }
        } catch (e: any) {
            throw new Error(`Swarm deployment failed: ${e.message}`);
        }
    }
}
