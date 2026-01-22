import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const login = async (username: string) => {
    const res = await api.post('/auth/login/mock', { username });
    if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
};

export const getProjects = async () => {
    const res = await api.get('/projects');
    return res.data;
};

export const getProject = async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
};

export const triggerDeployment = async (projectId: string) => {
    const res = await api.post(`/deployments/${projectId}/trigger`);
    return res.data;
};
