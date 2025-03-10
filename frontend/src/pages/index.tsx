import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home: React.FC = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Simulate loading effect
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.onended = () => {
        setVideoEnded(true);
        // Optionally navigate to login page
        // router.push('/auth/login');
      };
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-white">
      <Head>
        <title>SturgTrader - AR-Enhanced Trading Platform</title>
        <meta name="description" content="Experience the future of trading with SturgTrader's AR visualization and cross-exchange arbitrage" />
      </Head>
      
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-positive)] opacity-20 blur-2xl transform animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--color-neutral)] opacity-10 blur-xl" />
        
        {/* Navigation */}
        {videoEnded && (
          <nav className="absolute top-0 left-0 right-0 z-20 glass-panel px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold bright-green-text">STURG<span className="text-white">TRADER</span></div>
            
            <div className="hidden md:flex space-x-6">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#ar-experience">AR Experience</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
              <NavLink href="#about">About</NavLink>
            </div>
            
            <div className="flex space-x-4">
              <Link 
                href="/hyperliquid-trading"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-all duration-300"
              >
                Hyperliquid Trading
              </Link>
              <Link 
                href="/auth/login"
                className="px-4 py-2 metallic-bg rounded-md hover:shadow-lg transition-all duration-300"
              >
                Login
              </Link>
              <Link 
                href="/auth/register"
                className="btn-primary"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        )}
        
        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-center items-center text-center">
          {!videoEnded ? (
            <div className="w-full h-full flex items-center justify-center">
              <video 
                ref={videoRef}
                id="introVideo" 
                className="max-w-full max-h-full object-contain" 
                autoPlay 
                muted={false}
                playsInline
                controls={true}
                onError={(e) => {
                  console.error("Video error:", e);
                }}
              >
                <source src="/videos/youtube_clip_1080p.mp4.mkv" type="video/mp4" />
                <source src="/videos/youtube_clip_1080p.mp4.mkv" type="video/x-matroska" />
                <source src="/videos/youtube_clip_1080p.mp4.mkv" type="application/octet-stream" />
                <p>Your browser doesn't support HTML5 video. Please download the video <a href="/videos/youtube_clip_1080p.mp4.mkv">here</a>.</p>
              </video>
            </div>
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - would connect to API in real app
    if (email && password) {
      router.push('/dashboard');
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="glass-panel p-8 rounded-xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to continue to SturgTrader</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-positive)]"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
              <a href="#" className="text-sm text-[var(--color-positive)]">Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-positive)]"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              className="w-full btn-primary py-3 px-4 font-medium"
            >
              Sign in
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-[var(--color-positive)]">
                Create account
              </Link>
            </p>
          </div>
        </form>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link href="/dashboard" className="btn-secondary">
          Continue to Dashboard Demo
        </Link>
      </div>
    </div>
  );
};

// Helper Components
const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} className="text-gray-300 hover:text-white transition-colors duration-300">
    {children}
  </a>
);

export default Home;
