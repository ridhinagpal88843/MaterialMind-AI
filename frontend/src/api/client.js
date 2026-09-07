import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.detail ||
      error.message ||
      'An unexpected communication error occurred with the MaterialMind backend.';
    const customError = new Error(errorMsg);
    customError.response = error.response;
    return Promise.reject(customError);
  }
);
