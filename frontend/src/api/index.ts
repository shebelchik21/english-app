import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Telegram initData to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
    config.headers['x-telegram-init-data'] = window.Telegram.WebApp.initData;
  }
  return config;
});

// Auth
export const authApi = {
  getMe: () => api.get('/auth/me'),
};

// Packages
export const packagesApi = {
  getMyPackages: () => api.get('/packages'),
  createPackage: (data: { name: string; lessonsTotal: number; expiresAt: string; studentId: number }) =>
    api.post('/packages', data),
  getStudentPackages: (studentId: number) => api.get(`/packages/student/${studentId}`),
  deactivate: (id: number) => api.patch(`/packages/${id}/deactivate`),
};

// Slots
export const slotsApi = {
  getAvailable: () => api.get('/slots'),
  getAll: () => api.get('/slots/all'),
  create: (data: { date: string; startTime: string; endTime: string }) => api.post('/slots', data),
  createBulk: (slots: { date: string; startTime: string; endTime: string }[]) =>
    api.post('/slots/bulk', { slots }),
  delete: (id: number) => api.delete(`/slots/${id}`),
};

// Bookings
export const bookingsApi = {
  getMyBookings: () => api.get('/bookings'),
  getAll: () => api.get('/bookings/all'),
  create: (data: { slotId: number; packageId: number }) => api.post('/bookings', data),
  confirm: (id: number) => api.patch(`/bookings/${id}/confirm`),
  cancel: (id: number) => api.patch(`/bookings/${id}/cancel`),
};

// Students (admin)
export const studentsApi = {
  getAll: () => api.get('/students'),
  getOne: (id: number) => api.get(`/students/${id}`),
};

export default api;
