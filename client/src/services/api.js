import axios from 'axios';

// Create base API instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (config && config.headers) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API response error:', error);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error && error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error && error.response && error.response.status === 403) {
      console.error('Access forbidden: Insufficient permissions');
    }
    
    // Handle 500 Server Error
    if (error && error.response && error.response.status === 500) {
      console.error('Server error: Please try again later');
    }
    
    return Promise.reject(error);
  }
);

// Utility methods for common HTTP operations
const http = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;
export { http };
