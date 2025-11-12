// ============================================
// API SERVICE - AXIOS CONFIGURATION
// ============================================
// Zentrale API-Konfiguration mit Axios
// Automatisches Token-Handling für authentifizierte Requests

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Base URL vom Backend
const API_BASE_URL = 'http://localhost:5000/api';

// Axios Instance erstellen
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 Sekunden Timeout
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
// Fügt automatisch JWT Token zu allen Requests hinzu

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token aus localStorage holen
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
// Error Handling für 401 (Unauthorized)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token ungültig -> Logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optional: Redirect zu Login (später mit React Router)
      console.error('Token ungültig. Bitte neu einloggen.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
