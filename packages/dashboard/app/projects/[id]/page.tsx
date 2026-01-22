'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject, triggerDeployment } from '@/lib/api';
import { Project, Deployment } from '@/types';
import { ArrowLeft, Play, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ProjectDetails extends Project {
    deployments: Deployment[];
}

export default function ProjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    useEffect(() => {
        if (id) fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const data = await getProject(id as string);
            setProject(data);
        } catch (error) {
            console.error('Failed to fetch project', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrigger = async () => {
        if (!project) return;
        setTriggering(true);
        try {
            await triggerDeployment(project.id);
            // Refresh explicitly
            await fetchProject();
        } catch (error) {
            alert('Failed to trigger deployment');
        } finally {
            setTriggering(false);
        }
    };

    if (loading) return <div className="p-8 text-center bg-gray-50 min-h-screen">Loading...</div>;
    if (!project) return <div className="p-8 text-center bg-gray-50 min-h-screen">Project not found</div>;

    const latestDeployment = project.deployments[0];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 md:bg-white/80 backdrop-blur-md z-10">
                <div className="container px-4 mx-auto h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-800">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">{project.name}</h1>
                        <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 rounded border">
                            {project.branch}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={fetchProject}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleTrigger}
                            disabled={triggering}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {triggering ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            Deploy
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Latest Deployment</h2>
                            {latestDeployment ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className={`
                                            px-3 py-1 rounded-full text-sm font-medium
                                            ${latestDeployment.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
                                                latestDeployment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'}
                                        `}>
                                            {latestDeployment.status}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(latestDeployment.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                                        <p>$ git commit -m "{latestDeployment.commitMessage || 'No message'}"</p>
                                        <p className="text-gray-500">Hash: {latestDeployment.commitHash.substring(0, 7)}</p>
                                    </div>
                                    {latestDeployment.status === 'RUNNING' && (
                                        <a
                                            href={`http://${project.name}.localhost:8082`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-600 hover:underline"
                                        >
                                            Visit Live App <ExternalLink className="w-4 h-4 ml-1" />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No deployments yet</div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg border shadow-sm">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold">Deployment History</h2>
                            </div>
                            <div className="divide-y">
                                {project.deployments.map((deployment) => (
                                    <div key={deployment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className={`w-2.5 h-2.5 rounded-full ${deployment.status === 'RUNNING' ? 'bg-green-500' :
                                                        deployment.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`} />
                                                <span className="font-medium text-gray-900">{deployment.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-mono">
                                                {deployment.commitHash.substring(0, 7)} - {deployment.commitMessage || 'Manual Trigger'}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            {new Date(deployment.createdAt).toLocaleDateString()}
                                            <br />
                                            {new Date(deployment.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800">Git Integration</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Repository</label>
                                    <p className="text-sm font-mono break-all">{project.gitRepository}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Branch</label>
                                    <p className="text-sm font-mono">{project.branch}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
