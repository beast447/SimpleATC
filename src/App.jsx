import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CallsignProvider, useCallsign } from './contexts/CallsignContext';
import CallsignModal from './components/CallsignModal';
import ATCScenario from './components/ATCScenario';
import AuthModal from './components/Auth/AuthModal';
import UserMenu from './components/Auth/UserMenu';
import SplashScreen from './components/SplashScreen';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return supabaseUrl && !supabaseUrl.includes('your-project-ref');
};

// Separate component to access auth context
const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const [forceLoaded, setForceLoaded] = useState(false);
  const { user, loading } = useAuth();
  const { callsign, phraseology } = useCallsign();
  const [isCallsignModalOpen, setIsCallsignModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Force loading to complete after 10 seconds as absolute fallback
  useEffect(() => {
    const forceLoadTimeout = setTimeout(() => {
      console.warn('Forcing app to load after timeout');
      setForceLoaded(true);
    }, 10000);

    if (!loading) {
      clearTimeout(forceLoadTimeout);
      setForceLoaded(false); // Reset force loaded when loading completes normally
    }

    return () => clearTimeout(forceLoadTimeout);
  }, [loading]);

  // Auto-open Callsign modal only after splash dismissed and data missing
  useEffect(() => {
    if (!showSplash && (!callsign || !phraseology)) {
      setIsCallsignModalOpen(true);
    }
  }, [callsign, phraseology, showSplash]);

  const openSignIn = () => {
    if (!isSupabaseConfigured()) {
      alert('Authentication is not available in demo mode. Please set up Supabase to enable user accounts.');
      return;
    }
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    if (!isSupabaseConfigured()) {
      alert('Authentication is not available in demo mode. Please set up Supabase to enable user accounts.');
      return;
    }
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const openProfile = () => {
    // TODO: Implement profile modal
    console.log('Profile modal - coming soon!');
  };

  const handleCloseSplash = () => {
    setShowSplash(false);
  };

  if (loading && !forceLoaded) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '1.2rem',
          gap: '20px'
        }}>
          <div>Loading SimpleATC...</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Initializing speech recognition and training modules
          </div>
          {forceLoaded && (
            <div style={{ fontSize: '0.8rem', color: '#ffd700' }}>
              Taking longer than expected - switching to demo mode
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Demo Mode Banner */}
      {!isSupabaseConfigured() && (
        <div style={{
          background: 'linear-gradient(45deg, #ff9500, #ff6b00)',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          🚀 DEMO MODE • Full training available • Set up Supabase for progress tracking
        </div>
      )}

      {/* Supabase Connected Banner removed for cleaner UI */}
      
      <header className="header">
        {/* Top bar with callsign button (left) and authentication controls (right) */}
        <div className="header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
          {/* Callsign / Phraseology button */}
          <button
            onClick={() => setIsCallsignModalOpen(true)}
            className="btn btn-light"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Callsign / Phraseology
          </button>

          {/* Authentication controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <UserMenu />
            ) : (
              <>
                <button
                  onClick={openSignIn}
                  className="btn btn-secondary"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={openSignUp}
                  className="btn btn-primary"
                  style={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main title and tagline */}
        <h1>SimpleATC</h1>
        <p>Virtual ATC Phraseology Trainer</p>
        <p style={{ fontSize: '1rem', marginTop: '10px' }}>
          Practice your radio communications with realistic ATC scenarios
        </p>

        {/* Authenticated welcome banner */}
        {user && (
          <div className="progress-message" style={{ 
            marginTop: '15px', 
            padding: '10px 15px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            Welcome back! Your progress is now being saved automatically. 📊
          </div>
        )}
      </header>

      <main>
        <ATCScenario />
      </main>

      {/* Callsign selection modal */}
      <CallsignModal isOpen={isCallsignModalOpen} onClose={() => setIsCallsignModalOpen(false)} />

      {!user && (
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          color: 'white'
        }}>
          <h3>🚀 Get More from SimpleATC!</h3>
          <p style={{ marginBottom: '15px' }}>
            {isSupabaseConfigured() 
              ? 'Create an account to track your progress, save your scores, and unlock advanced features!'
              : 'Enjoying the training? Set up Supabase to enable progress tracking and user accounts!'
            }
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={openSignUp} className="btn btn-primary">
              {isSupabaseConfigured() ? 'Sign Up' : 'Setup Required'}
            </button>
            <button onClick={openSignIn} className="btn btn-secondary">
              {isSupabaseConfigured() ? 'Sign In' : 'Demo Mode'}
            </button>
          </div>
        </div>
      )}

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        padding: '20px',
        color: 'white',
        opacity: '0.8',
        fontSize: '0.9rem'
      }}>
        <p>
          🎧 Best experienced with headphones • 🎤 Requires microphone access
        </p>
        <p style={{ marginTop: '10px' }}>
          Perfect for VATSIM preparation and student pilot training
        </p>
        <p style={{ marginTop: '10px' }}>
          <a href="https://discord.gg/4TfgMeHB" target="_blank" rel="noopener noreferrer" style={{ background: '#5865F2', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            💬 Contact Support on Discord
          </a>
        </p>
        {/* Legal links */}
        <p style={{ marginTop: '14px' }}>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Terms&nbsp;of&nbsp;Service</a>
          &nbsp;&bull;&nbsp;
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Privacy&nbsp;Policy</a>
          &nbsp;&bull;&nbsp;
          <a href="/refund.html" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Refund&nbsp;Policy</a>
        </p>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {showSplash && <SplashScreen onClose={handleCloseSplash} />}
    </div>
  );
};

// Main App component with AuthProvider
function App() {
  console.log('🚀 SimpleATC App starting...');
  
  return (
    <AuthProvider>
      <CallsignProvider>
        <AppContent />
      </CallsignProvider>
    </AuthProvider>
  );
}

export default App; 