import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home: React.FC = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted
  const [userInteracted, setUserInteracted] = useState(true); // Auto-start
  const [currentInitStep, setCurrentInitStep] = useState(0);
  const [showInitText, setShowInitText] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const initAudioRefs = useRef<HTMLAudioElement[]>([]);
  
  // Initialization steps with timing
  const initSteps = [
    { text: "Initializing Cruze Agents", time: 2000, audioFile: "/audio/init-cruze-agents.mp3" },
    { text: "Loading Freqtrade AI strategies", time: 2000, audioFile: "/audio/init-freqtrade.mp3" },
    { text: "Connecting to HyperLiquid Exchange", time: 1800, audioFile: "/audio/init-hyperliquid.mp3" },
    { text: "Analyzing market conditions", time: 2200, audioFile: "/audio/init-market.mp3" },
    { text: "Calibrating risk parameters", time: 1900, audioFile: "/audio/init-risk.mp3" },
    { text: "Synchronizing trading algorithms", time: 2500, audioFile: "/audio/init-algorithms.mp3" },
    { text: "SturgTrader system initialization complete", time: 2500, audioFile: "/audio/init-complete.mp3" },
  ];
  
  // Simulate loading effect
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Setup autoplay
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && userInteracted) {
      // Auto-play video when component mounts (unmuted for better experience)
      videoElement.muted = false;
      setIsMuted(false);
      
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Video autoplay failed:", err);
          // If autoplay fails with sound, try muted autoplay as fallback
          videoElement.muted = true;
          setIsMuted(true);
          videoElement.play().catch(e => 
            console.error("Muted autoplay also failed:", e)
          );
        });
      }
      
      videoElement.onended = () => {
        handleVideoEnd();
      };

      // Start initialization sequence
      runInitializationSequence();
    }

    // Setup document-wide click listener to detect first interaction
    const handleFirstInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        document.removeEventListener('click', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [userInteracted]);

  // Run the AI initialization sequence
  const runInitializationSequence = () => {
    let currentStep = 0;
    
    const runNextStep = () => {
      if (currentStep < initSteps.length) {
        setCurrentInitStep(currentStep);
        
        // Play the audio for current step
        try {
          if (initAudioRefs.current[currentStep]) {
            initAudioRefs.current[currentStep].play().catch(err => {
              console.error(`Failed to play init audio ${currentStep}:`, err);
            });
          }
        } catch (error) {
          console.error("Audio play error:", error);
        }
        
        // Schedule next step
        setTimeout(() => {
          currentStep++;
          if (currentStep < initSteps.length) {
            runNextStep();
          } else {
            // All initialization complete
            setTimeout(() => {
              setShowInitText(false);
            }, 2000);
          }
        }, initSteps[currentStep].time);
      }
    };
    
    // Start sequence
    runNextStep();
  };

  const handleVideoEnd = () => {
    setIsFading(true);
    setShowInitText(false);
    
    // Play the welcome voice when starting to fade
    if (audioRef.current && userInteracted) {
      const audioPromise = audioRef.current.play();
      if (audioPromise !== undefined) {
        audioPromise.catch(err => {
          console.error("Failed to play welcome audio:", err);
        });
      }
    }
    
    // Add a delay before showing login screen to allow for fade effect
    setTimeout(() => {
      setVideoEnded(true);
    }, 1000); // 1 second fade duration
  };

  const handleSkipVideo = () => {
    setUserInteracted(true); // Ensure user interaction is registered
    setShowInitText(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleVideoEnd();
  };

  const handleDirectLogin = () => {
    setUserInteracted(true); // Ensure user interaction is registered
    setShowInitText(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    router.push('/auth/login');
  };

  const toggleMute = () => {
    setUserInteracted(true); // Ensure user interaction is registered
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If user unmutes, try to play video if it's paused
      if (!newMutedState && videoRef.current.paused) {
        videoRef.current.play().catch(err => {
          console.error("Failed to play video after unmute:", err);
        });
      }
    }
  };

  // Handle video error and audio load errors gracefully
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    // If video fails to load, we can skip directly to login
    handleVideoEnd();
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Audio error:", e);
    // Continue with normal flow even if audio fails
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-white">
      <Head>
        <title>SturgTrader - AR-Enhanced Trading Platform</title>
        <meta name="description" content="Experience the future of trading with SturgTrader's AR visualization and cross-exchange arbitrage" />
      </Head>
      
      {/* Hidden audio element for welcome voice */}
      <audio 
        ref={audioRef} 
        src="/audio/welcome-voice.mp3" 
        preload="auto"
        onError={handleAudioError}
      />

      {/* Hidden audio elements for initialization steps */}
      {initSteps.map((step, index) => (
        <audio
          key={`init-audio-${index}`}
          ref={el => {
            if (el) initAudioRefs.current[index] = el;
          }}
          src={step.audioFile}
          preload="auto"
          onError={handleAudioError}
        />
      ))}
      
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-positive)] opacity-20 blur-2xl transform animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--color-neutral)] opacity-10 blur-xl" />
        
        {/* Navigation */}
        {videoEnded && (
          <nav className="absolute top-0 left-0 right-0 z-20 glass-panel px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold bright-blue-text">STURG<span className="text-white">TRADER</span></div>
            
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
                href="/freqtrade-dashboard"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-md text-white transition-all duration-300"
              >
                Freqtrade Dashboard
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
            <div className={`w-full h-full flex flex-col items-center justify-center transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              {!userInteracted && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70">
                  <button 
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-xl transition-all duration-300 animate-pulse"
                    onClick={() => {
                      setUserInteracted(true);
                      if (videoRef.current) {
                        videoRef.current.muted = false;
                        setIsMuted(false);
                        videoRef.current.play().catch(e => {
                          console.error("Play failed:", e);
                          // Fallback to muted if unmuted fails
                          videoRef.current!.muted = true;
                          setIsMuted(true);
                          videoRef.current!.play().catch(e2 => 
                            console.error("Muted fallback failed:", e2)
                          );
                        });
                      }
                    }}
                  >
                    Click to Start Experience
                  </button>
                </div>
              )}
              
              {/* AI Initialization Text Overlay */}
              {showInitText && userInteracted && (
                <div className="absolute left-8 top-1/4 z-20 text-left">
                  <div className="glass-panel p-6 rounded-xl max-w-md border border-blue-500/30">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">System Initialization</h3>
                    <div className="space-y-3">
                      {initSteps.map((step, idx) => (
                        <div 
                          key={`init-step-${idx}`} 
                          className={`flex items-center ${idx > currentInitStep ? 'opacity-30' : idx === currentInitStep ? 'text-blue-300 font-medium' : 'text-green-300'}`}
                        >
                          {idx < currentInitStep ? (
                            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : idx === currentInitStep ? (
                            <div className="w-5 h-5 mr-2 border-t-2 border-blue-400 rounded-full animate-spin"></div>
                          ) : (
                            <div className="w-5 h-5 mr-2 rounded-full border border-gray-500"></div>
                          )}
                          <span className={idx === currentInitStep ? 'animate-pulse' : ''}>{step.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentInitStep / (initSteps.length - 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <video 
                  ref={videoRef}
                  id="introVideo" 
                  className="max-w-full max-h-full object-contain" 
                  autoPlay={false} 
                  muted={isMuted}
                  playsInline
                  controls={true}
                  onError={handleVideoError}
                >
                  <source src="/videos/youtube_clip_1080p.mp4.mkv" type="video/mp4" />
                  <source src="/videos/youtube_clip_1080p.mp4.mkv" type="video/x-matroska" />
                  <source src="/videos/youtube_clip_1080p.mp4.mkv" type="application/octet-stream" />
                  <p>Your browser doesn't support HTML5 video. Please download the video <a href="/videos/youtube_clip_1080p.mp4.mkv">here</a>.</p>
                </video>
                
                {/* Sound toggle button */}
                {userInteracted && (
                  <button 
                    onClick={toggleMute}
                    className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 p-2 rounded-full"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {/* Video control buttons - centered underneath */}
              <div className="mt-6 flex space-x-6">
                <button 
                  onClick={handleSkipVideo}
                  className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700 rounded-md text-white transition-all duration-300 flex items-center"
                >
                  <span>Skip Video</span>
                </button>
                <button 
                  onClick={handleDirectLogin}
                  className="px-6 py-3 bright-blue-bg hover:bg-blue-500 rounded-md text-black font-medium transition-all duration-300"
                >
                  Login To SturgTrader
                </button>
              </div>
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
