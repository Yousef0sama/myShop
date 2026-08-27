import axios from 'axios';

// * Create a base Axios instance for handling global HTTP requests
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// * Request Interceptor: Automatically attach the Bearer token if available
api.interceptors.request.use(
  (config) => {
    // ? Retrieve stored authentication data from LocalStorage
    const authData = JSON.parse(localStorage.getItem('authData'));

    // json-server-auth returns the JWT key as "accessToken"
    if (authData?.accessToken) {
      config.headers.Authorization = `Bearer ${authData.accessToken}`;
    }
    return config;
  },
  // ! Handle request setup errors before sending to the server
  (error) => Promise.reject(error)
);

// * Response Interceptor: Process responses and standardize global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ! Extract server error message or fallback to default error message
    const message =
      error.response?.data ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while connecting to the server';

    return Promise.reject(new Error(typeof message === 'string' ? message : 'Authentication error'));
  }
);

export default api;