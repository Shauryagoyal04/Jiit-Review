import axios from 'axios';

const api = axios.create({
 baseURL: 'http://localhost:5000/api', // Change this to your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Only auto-logout if token is invalid on protected routes
    if (status === 401 && url !== "/auth/login") {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);


export default api;