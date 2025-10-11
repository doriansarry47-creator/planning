import axios from 'axios';
import { mockAuth, mockPractitioners, mockAppointments } from './mock-auth';
import { mockAvailability } from './mock-availability';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK_API = true; // Set to false when real API is available

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API wrapper that simulates real API responses
export const mockApiWrapper = {
  // Auth endpoints
  post: async (endpoint: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    if (endpoint.includes('/auth/login')) {
      const userType = new URLSearchParams(endpoint.split('?')[1] || '').get('userType') as 'admin' | 'patient';
      const result = await mockAuth.login(data.email, data.password, userType);
      return { data: result };
    }
    
    if (endpoint.includes('/auth/register')) {
      const userType = new URLSearchParams(endpoint.split('?')[1] || '').get('userType') as 'admin' | 'patient';
      const result = await mockAuth.register(data, userType);
      return { data: result };
    }
    
    if (endpoint.includes('/practitioners')) {
      const result = await mockPractitioners.create(data);
      return { data: result };
    }
    
    if (endpoint.includes('/appointments')) {
      const result = await mockAppointments.create(data);
      return { data: result };
    }
    
    if (endpoint.includes('/availability-slots')) {
      const created = mockAvailability.create({
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration ?? 60,
        isAvailable: true,
        isRecurring: !!data.isRecurring,
        recurringPattern: data.recurringPattern,
        dayOfWeek: data.dayOfWeek,
        notes: data.notes,
      });
      return { data: created };
    }
    
    throw new Error(`Endpoint ${endpoint} not mocked`);
  },

  get: async (endpoint: string) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    if (endpoint.includes('/practitioners')) {
      const result = await mockPractitioners.getAll();
      return { data: result };
    }
    
    if (endpoint.includes('/appointments')) {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = mockAuth.verifyToken(token);
        if (payload.userType === 'admin') {
          const result = await mockAppointments.getAll();
          return { data: result };
        } else {
          const result = await mockAppointments.getByPatient(payload.userId);
          return { data: result };
        }
      }
      return { data: [] };
    }
    
    if (endpoint.includes('/availability-slots')) {
      const url = new URL('http://local' + endpoint); // dummy base for parsing params
      const startDate = url.searchParams.get('startDate') || undefined;
      const endDate = url.searchParams.get('endDate') || undefined;
      const availableParam = url.searchParams.get('available');
      const available = availableParam === null ? undefined : availableParam === 'true';
      const { slots, total } = mockAvailability.get({ startDate, endDate, available });
      return { data: { slots, total } };
    }
    
    throw new Error(`Endpoint ${endpoint} not mocked`);
  },

  put: async (endpoint: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
    
    if (endpoint.includes('/appointments/')) {
      const id = endpoint.split('/').pop();
      if (id) {
        const result = await mockAppointments.update(id, data);
        return { data: result };
      }
    }
    
    if (endpoint.includes('/availability-slots/')) {
      const id = endpoint.split('/').pop();
      if (id) {
        const updated = mockAvailability.update(id, data);
        return { data: updated };
      }
    }
    
    throw new Error(`Endpoint ${endpoint} not mocked`);
  },

  // Support PATCH similar to PUT in mock mode
  patch: async (endpoint: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (endpoint.includes('/appointments/')) {
      const id = endpoint.split('/').pop();
      if (id) {
        const result = await mockAppointments.update(id, data);
        return { data: result };
      }
    }
    
    if (endpoint.includes('/availability-slots/')) {
      const id = endpoint.split('/').pop();
      if (id) {
        const updated = mockAvailability.update(id, data);
        return { data: updated };
      }
    }
    
    throw new Error(`Endpoint ${endpoint} not mocked`);
  },

  delete: async (endpoint: string) => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
    
    if (endpoint.includes('/appointments/')) {
      const id = endpoint.split('/').pop();
      if (id) {
        await mockAppointments.delete(id);
        return { data: { success: true } };
      }
    }
    
    if (endpoint.includes('/availability-slots/')) {
      const id = endpoint.split('/').pop();
      if (id) {
        const deleted = mockAvailability.delete(id);
        return { data: deleted };
      }
    }
    
    throw new Error(`Endpoint ${endpoint} not mocked`);
  }
};

// Use mock API if enabled, otherwise use real API
const apiClient = USE_MOCK_API ? mockApiWrapper : api;

export default apiClient;