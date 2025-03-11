import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      // For demo purposes, we'll just redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="relative">
        {/* Glassmorphic effect background elements */}
        <div className="absolute top-[-100px] left-[-100px] w-64 h-64 rounded-full bg-[var(--color-positive)] opacity-20 blur-2xl transform animate-pulse" />
        <div className="absolute bottom-[-80px] right-[-80px] w-64 h-64 rounded-full bg-[var(--color-neutral)] opacity-10 blur-xl" />
        
        {/* Login Form */}
        <div className="glass-panel p-8 rounded-xl w-full max-w-md shadow-xl relative z-10 border border-[var(--glass-border)]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-2">Log in to access your The Bank account</p>
          </div>
          
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-glass w-full"
                required
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-gray-300 text-sm font-medium">
                  Password
                </label>
                <Link 
                  href="/auth/forgot-password"
                  className="text-[var(--color-positive)] hover:text-[var(--color-positive)]/80 text-sm font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-glass w-full"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 text-white font-medium rounded-md transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link 
                href="/auth/register"
                className="text-[var(--color-positive)] hover:text-[var(--color-positive)]/80 font-medium"
              >
                Create account
              </Link>
            </p>
          </div>
          
          <div className="flex items-center justify-center mt-8">
            <Link 
              href="/"
              className="text-gray-400 hover:text-white text-sm flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
