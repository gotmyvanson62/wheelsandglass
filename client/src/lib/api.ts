/// <reference types="vite/client" />
import axios from 'axios';
import type { ApiResponse } from 'shared';

const apiClient = axios.create({
  baseURL: (import.meta.env?.VITE_API_URL as string) || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Jobs
  jobs: {
    list: (params?: any) => apiClient.get<ApiResponse>('/jobs', { params }).then(r => r.data),
    get: (id: number) => apiClient.get<ApiResponse>(`/jobs/${id}`).then(r => r.data),
    create: (data: any) => apiClient.post<ApiResponse>('/jobs', data).then(r => r.data),
    update: (id: number, data: any) => apiClient.put<ApiResponse>(`/jobs/${id}`, data).then(r => r.data),
    delete: (id: number) => apiClient.delete<ApiResponse>(`/jobs/${id}`).then(r => r.data),
    syncOmega: (id: number) => apiClient.post<ApiResponse>(`/jobs/${id}/sync-omega`).then(r => r.data),
    stats: () => apiClient.get<ApiResponse>('/jobs/stats/summary').then(r => r.data),
  },

  // Appointments
  appointments: {
    list: (params?: any) => apiClient.get<ApiResponse>('/appointments', { params }).then(r => r.data),
    get: (id: number) => apiClient.get<ApiResponse>(`/appointments/${id}`).then(r => r.data),
    create: (data: any) => apiClient.post<ApiResponse>('/appointments', data).then(r => r.data),
    update: (id: number, data: any) => apiClient.put<ApiResponse>(`/appointments/${id}`, data).then(r => r.data),
    delete: (id: number) => apiClient.delete<ApiResponse>(`/appointments/${id}`).then(r => r.data),
  },

  // Payments
  payments: {
    list: (params?: any) => apiClient.get<ApiResponse>('/payments', { params }).then(r => r.data),
    get: (id: number) => apiClient.get<ApiResponse>(`/payments/${id}`).then(r => r.data),
    create: (data: any) => apiClient.post<ApiResponse>('/payments', data).then(r => r.data),
  },

  // Dashboard
  dashboard: {
    stats: () => apiClient.get<ApiResponse>('/dashboard/stats').then(r => r.data),
    revenue: () => apiClient.get<ApiResponse>('/dashboard/revenue').then(r => r.data),
    activity: () => apiClient.get<ApiResponse>('/dashboard/recent-activity').then(r => r.data),
  },

  // Communications
  communications: {
    sms: {
      list: (params?: any) => apiClient.get<ApiResponse>('/communications/sms', { params }).then(r => r.data),
      send: (data: any) => apiClient.post<ApiResponse>('/communications/sms/send', data).then(r => r.data),
    },
  },
};

export default apiClient;
