import axios from 'axios';

// Get the current host for API calls (works for both localhost and production)
const getBaseURL = () => {
  // Check for environment variable first (Vite uses VITE_ prefix)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    // In browser
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Check if we're in production (deployed)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Production: use same domain with /api (Vercel serverless functions)
      return `${protocol}//${hostname}/api`;
    } else {
      // Development: use different port (your local Express server)
      return `${protocol}//${hostname}:5001/api`;
    }
  }
  return 'http://localhost:5001/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userMobile');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
