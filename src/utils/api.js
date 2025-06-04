import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    }

    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        // Unauthorized - clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        }
        break;
      case 403:
        // Forbidden
        toast.error('Access denied. You do not have permission for this action.');
        break;
      case 404:
        // Not found
        toast.error('Resource not found.');
        break;
      case 500:
        // Server error
        toast.error('Server error. Please try again later.');
        break;
      default:
        // Other errors
        const message = error.response?.data?.message || 'Something went wrong';
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api; 