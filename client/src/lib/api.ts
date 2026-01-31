/// <reference types="vite/client" />
import axios from 'axios';
import type { ApiResponse } from 'shared';
import type {
  Job,
  JobStats,
  Appointment,
  Payment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CreatePaymentRequest,
} from '@/types/api';

const apiClient = axios.create({
  baseURL: (import.meta.env?.VITE_API_URL as string) || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // SECURITY: Include cookies in requests (for httpOnly auth token)
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // SECURITY: Check localStorage for backwards compatibility during migration
    // The server now sets httpOnly cookies, but older sessions may still use localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Note: httpOnly cookie is automatically included via withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // SECURITY: Clear localStorage token on auth failure
      localStorage.removeItem('authToken');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods with typed interfaces
export const api = {
  // Jobs
  jobs: {
    list: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<Job[]>>('/jobs', { params }).then(r => r.data),
    get: (id: number) =>
      apiClient.get<ApiResponse<Job>>(`/jobs/${id}`).then(r => r.data),
    create: (data: Partial<Job>) =>
      apiClient.post<ApiResponse<Job>>('/jobs', data).then(r => r.data),
    update: (id: number, data: Partial<Job>) =>
      apiClient.put<ApiResponse<Job>>(`/jobs/${id}`, data).then(r => r.data),
    delete: (id: number) =>
      apiClient.delete<ApiResponse<void>>(`/jobs/${id}`).then(r => r.data),
    syncOmega: (id: number) =>
      apiClient.post<ApiResponse<Job>>(`/jobs/${id}/sync-omega`).then(r => r.data),
    stats: () =>
      apiClient.get<ApiResponse<JobStats>>('/jobs/stats/summary').then(r => r.data),
  },

  // Appointments
  appointments: {
    list: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<Appointment[]>>('/appointments', { params }).then(r => r.data),
    get: (id: number) =>
      apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`).then(r => r.data),
    create: (data: CreateAppointmentRequest) =>
      apiClient.post<ApiResponse<Appointment>>('/appointments', data).then(r => r.data),
    update: (id: number, data: UpdateAppointmentRequest) =>
      apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}`, data).then(r => r.data),
    delete: (id: number) =>
      apiClient.delete<ApiResponse<void>>(`/appointments/${id}`).then(r => r.data),
  },

  // Payments
  payments: {
    list: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<Payment[]>>('/payments', { params }).then(r => r.data),
    get: (id: number) =>
      apiClient.get<ApiResponse<Payment>>(`/payments/${id}`).then(r => r.data),
    create: (data: CreatePaymentRequest) =>
      apiClient.post<ApiResponse<Payment>>('/payments', data).then(r => r.data),
  },

  // Dashboard
  dashboard: {
    stats: () =>
      apiClient.get<ApiResponse>('/dashboard/stats').then(r => r.data),
    revenue: () =>
      apiClient.get<ApiResponse>('/dashboard/revenue').then(r => r.data),
    activity: () =>
      apiClient.get<ApiResponse>('/dashboard/recent-activity').then(r => r.data),
  },

  // Communications
  communications: {
    sms: {
      list: (params?: Record<string, unknown>) =>
        apiClient.get<ApiResponse>('/communications/sms', { params }).then(r => r.data),
      send: (data: { to: string; message: string }) =>
        apiClient.post<ApiResponse>('/communications/sms/send', data).then(r => r.data),
    },
  },
};

export default apiClient;
