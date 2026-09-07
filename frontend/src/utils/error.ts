import { AxiosError } from 'axios';

export interface BackendErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Array<{ path?: string[]; message: string }> | Record<string, string>;
}

export function extractErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;

  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.response?.status === 401) {
      return 'Authentication required. Please log in.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your network connection.';
    }
    if (error.message === 'Network Error') {
      return 'Network error. Please ensure the backend server is running.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
