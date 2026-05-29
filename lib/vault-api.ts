import axios from 'axios';
import { getCsrfToken } from './csrf';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

const api = axios.create({
    baseURL: API_BASE
});

// Add Auth and CSRF to requests
api.interceptors.request.use((config) => {
    // Auth Token
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token') || 
                      localStorage.getItem('accessToken') || 
                      localStorage.getItem('auth-token');
        if (token && token !== 'undefined') {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    // CSRF Token
    if (config.method !== 'get') {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
    }
    return config;
});

export const vaultApi = {
    getDocuments: async (params?: any) => {
        const response = await api.get('/admin-portal/v1/vault/documents/', { params });
        const raw = response.data;
        // Handle {data: {data: [...]}}, {data: [...]}, {results: [...]}, or direct array
        const result = raw?.data?.data || raw?.data?.results || raw?.data || raw?.results || (Array.isArray(raw) ? raw : []);
        return Array.isArray(result) ? result : [];
    },
    getDocument: async (id: string) => {
        const response = await api.get(`/admin-portal/v1/vault/documents/${id}/`);
        const raw = response.data;
        return raw?.data?.data || raw?.data || raw;
    },
    getFolders: async (params?: any) => {
        const response = await api.get('/admin-portal/v1/vault/folders/', { params });
        const raw = response.data;
        const result = raw?.data?.data || raw?.data?.results || raw?.data || raw?.results || (Array.isArray(raw) ? raw : []);
        return Array.isArray(result) ? result : [];
    },
    getActivity: async () => {
        const response = await api.get('/admin-portal/v1/vault/activity/');
        const raw = response.data;
        const result = raw?.data?.data || raw?.data?.results || raw?.data || raw?.results || (Array.isArray(raw) ? raw : []);
        return Array.isArray(result) ? result : [];
    },
    createFolder: async (data: { name: string; parent?: string; client?: string }) => {
        const response = await api.post('/admin-portal/v1/vault/folders/', data);
        return response.data.data;
    },
    updateDocument: async (id: string, updates: any) => {
        const response = await api.patch(`/admin-portal/v1/vault/documents/${id}/`, updates);
        return response.data.data;
    },
    batchUpdate: async (ids: string[], updates: any) => {
        const response = await api.post('/admin-portal/v1/vault/documents/batch-update/', { ids, updates });
        return response.data.data;
    },
    deleteDocument: async (id: string) => {
        const response = await api.delete(`/admin-portal/v1/vault/documents/${id}/`);
        return response.data.data;
    },
    createGoogleDoc: async (data: { title: string; client_id: string; type: string; folder_id?: string | null }) => {
        const response = await api.post('/admin-portal/v1/vault/documents/create-google-doc/', data);
        return response.data.data;
    },
    uploadDocument: async (docData: any, file: File) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', docData.title);
        formData.append('client', docData.client); // Client ID
        formData.append('category', docData.category);
        formData.append('visibility', docData.visibility);
        formData.append('access_rule_type', docData.accessRule.type);
        formData.append('access_rule_description', docData.accessRule.description);
        
        if (docData.folderId) {
            formData.append('folder', docData.folderId);
        }
        
        const response = await api.post('/admin-portal/v1/vault/documents/', formData);
        return response.data.data;
    }
};
