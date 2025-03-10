import { secureApiClient } from './secureApiClient';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  requiresMfa: boolean;
  user: UserProfile;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription: string;
}

export class AuthService {
  private static instance: AuthService;
  private userProfile: UserProfile | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<{ success: boolean; requiresMfa: boolean }> {
    try {
      // In a real app, this would be an API call to your authentication endpoint
      // Here we're simulating it for demonstration purposes
      const response: LoginResponse = await this.simulateLogin(credentials);
      
      if (response.token) {
        secureApiClient.setToken(response.token);
        this.userProfile = response.user;
        
        return { 
          success: true, 
          requiresMfa: response.requiresMfa 
        };
      }
      
      return { success: false, requiresMfa: false };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, requiresMfa: false };
    }
  }

  public async verifyMfa(code: string): Promise<boolean> {
    try {
      // In a real app, this would verify the MFA code with your backend
      // Here we're just simulating it
      return code === '123456';
    } catch (error) {
      console.error('MFA verification failed:', error);
      return false;
    }
  }

  public async logout(): Promise<void> {
    secureApiClient.clearToken();
    this.userProfile = null;
    
    // In a real app, you might also want to invalidate the token on the server
    // await secureApiClient.post('/auth/logout', {});
  }

  public getProfile(): UserProfile | null {
    return this.userProfile;
  }

  public isAuthenticated(): boolean {
    return Boolean(secureApiClient.getToken());
  }

  // This is just for simulation; in a real app, this would be an actual API call
  private async simulateLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    // Pretend we're validating credentials
    if (credentials.email === 'demo@sturgtrader.com' && credentials.password === 'demo') {
      return {
        token: 'simulated_jwt_token_' + Date.now(),
        requiresMfa: true,
        user: {
          id: 'user123',
          name: 'Demo User',
          email: credentials.email,
          role: 'trader',
          subscription: 'pro'
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }
}

export const authService = AuthService.getInstance();
