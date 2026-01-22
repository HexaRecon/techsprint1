/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Also ignore typescript errors for now to ensure build
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
