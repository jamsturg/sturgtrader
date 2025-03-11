import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      // In a real implementation, this would use Firebase Auth
      // For demo purposes, we'll just simulate a successful login
      console.log('Logging in with:', { email, password });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMsg(error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      // In a real implementation, this would use Firebase Auth with Google provider
      console.log('Logging in with Google');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      setErrorMsg(error.message || 'Failed to login with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-background)]">
      {/* Background graphics - circles with glow */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[var(--color-positive)] opacity-20 blur-xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--color-neutral)] opacity-10 blur-xl" />
      
      {/* Login container */}
      <div className="glass-panel p-8 rounded-xl w-full max-w-md z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bright-green-text mb-1">TO THE <span className="text-white">BANK</span></div>
          <p className="text-[var(--color-neutral)]">Advanced Crypto Trading Platform</p>
        </div>
        
        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm">
            {errorMsg}
          </div>
        )}
        
        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-panel py-2 px-3 rounded-md bg-transparent border-none focus:ring-1 focus:ring-[var(--color-positive)]"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="password" className="block text-sm text-gray-400">Password</label>
              <Link href="/auth/forgot-password" className="text-sm bright-green-text hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-panel py-2 px-3 rounded-md bg-transparent border-none focus:ring-1 focus:ring-[var(--color-positive)]"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign In'}
            </button>
          </div>
        </form>
        
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-700"></div>
          <div className="px-3 text-sm text-gray-400">OR</div>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>
        
        {/* Social login */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-md bg-white/10 hover:bg-white/20 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        
        {/* Register link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="bright-green-text hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      
      {/* AR Mode teaser */}
      <div className="glass-panel mt-8 p-4 rounded-xl w-full max-w-md text-center z-10">
        <div className="flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 bright-green-text mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Augmented Reality Trading Experience</span>
        </div>
        <p className="text-xs text-gray-400">The Bank offers immersive AR visualization of market data. Sign in to experience the future of trading.</p>
      </div>
    </div>
  );
};

export default LoginPage;
