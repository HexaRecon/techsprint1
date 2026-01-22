# GenesisAI Platform - Project Walkthrough

## Current State

The application is a Next.js 14 app featuring a "GenesisAI" branded dashboard for managing Docker-native deployments.

### 1. Landing Page (`/`)
-   **Theme**: Dark mode, "GenesisAI" branding.
-   **Hero**: "From Prompt to Production" slogan.
-   **Visual**: Animated terminal demonstrating `genesis create` command.
-   **Action**: "Get Started" button redirects to `/login`.
-   **Features**: Displays "Docker Native", "AI Powered", "Secure by Default".

### 2. Login Flow (`/login`)
-   **UI**: "Welcome Back" card with "Continue with GitHub" button.
-   **Logic**: Redirects strictly to `${API_URL}/auth/github` (Real OAuth).
-   **Callback**: `/login/callback` handles the JWT token from the API and stores it in `localStorage`.

### 3. Dashboard (`/dashboard`)
-   **Protection**: Checks for token; redirects to `/login` if missing.
-   **Header**: "GenesisAI Platform" with Logout button.
-   **Content**: Lists user's synced projects (fetched from API).

### 4. Project Details (`/projects/[id]`)
-   **Route**: `/projects/[id]`
-   **Info**: Repository name and branch.
-   **Actions**: "Deploy" button to trigger a new build.
-   **History**: List of past deployments with status (`RUNNING`, `FAILED`, `QUEUED`) and commit hashes.
-   **Live Link**: If a deployment is `RUNNING`, a link to the subdomain (e.g., `http://project-name.localhost:8082`) is shown.

## API Integration
-   **Endpoint**: `http://localhost:3001`
-   **Auth**: GitHub OAuth strategy.
-   **Deployments**: Triggered via `POST /deployments/:id/trigger`.

## Deployment
The stack is configured for deployment with standard Docker tools.
-   **Dashboard**: Port 3000
-   **API**: Port 3001
-   **Services**: Postgres, Redis, MinIO, Traefik, Registry.
