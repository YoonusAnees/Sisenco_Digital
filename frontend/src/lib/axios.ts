import axios from 'axios';
import { extractErrorMessage } from '@/utils/error';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error formatting
    const formattedMessage = extractErrorMessage(error);
    if (error.response) {
      error.response.data = {
        ...error.response.data,
        friendlyMessage: formattedMessage,
      };
    }
    return Promise.reject(error);
  }
);
