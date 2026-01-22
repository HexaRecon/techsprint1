'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Link from 'next/link';
import { Project } from '../types';
import { Plus, Github } from 'lucide-react';

export function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading projects...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Projects</h2>
                <button className="flex items-center px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800">
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed rounded-lg">
                    <Github className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                    <p className="mt-1 text-gray-500">Import a Git repository to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id} className="block group">
                            <div className="p-6 bg-white border rounded-lg shadow-sm group-hover:shadow-md transition-all group-hover:border-blue-200">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600">{project.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 font-mono truncate">{project.gitRepository}</p>
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ready</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
