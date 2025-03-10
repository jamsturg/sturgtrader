import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API client for making HTTP requests
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use environment variable for API URL in production
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('auth_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP method wrappers
  async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  async delete<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, params });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
