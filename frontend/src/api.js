import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create an axios instance with the base URL pre-set
const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT to every request automatically, if one exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH FUNCTIONS
export const signup = (email, password) =>
  api.post('/auth/signup', { email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// PERIOD LOG FUNCTIONS
export const getPeriods = () => api.get('/periods');
export const getPredictions = () => api.get('/periods/predictions');

export const createPeriod = (start_date, end_date) =>
  api.post('/periods', { start_date, end_date });

export const updatePeriod = (id, data) =>
  api.put(`/periods/${id}`, data);

export const deletePeriod = (id) =>
  api.delete(`/periods/${id}`);

export default api;
