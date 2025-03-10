const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SecureApiClient {
  private token: string | null = null;

  constructor() {
    // In browser environment, try to load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      await this.handleResponse(response);
      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response);
      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response);
      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.handleResponse(response);
      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private async handleResponse(response: Response): Promise<void> {
    if (!response.ok) {
      // Handle 401 Unauthorized - refresh token or logout
      if (response.status === 401) {
        // Attempt to refresh token or redirect to login
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
  }

  private handleError(error: any): void {
    console.error('API request failed:', error);
    // Additional error logging or monitoring could be added here
  }
}

// Export singleton instance
export const secureApiClient = new SecureApiClient();
