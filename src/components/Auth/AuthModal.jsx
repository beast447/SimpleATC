import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const [mode, setMode] = useState(defaultMode); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [preferredCallsign, setPreferredCallsign] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);
  const paypalContainerRef = useRef(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    if (mode === 'signup' && !donationComplete) {
      setError('Please complete the PayPal donation before creating an account.');
      return;
    }
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else {
        const { error } = await signUp(email, password, {
          display_name: displayName,
          preferred_callsign: preferredCallsign
        });
        if (error) throw error;
        
        // Show success message for email confirmation
        setError('Please check your email to confirm your account!');
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setPreferredCallsign('');
    setError('');
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  // Load PayPal script when signup mode is selected and donation not complete
  useEffect(() => {
    if (mode !== 'signup' || donationComplete) return;

    // Avoid loading multiple times
    if (window.paypal) {
      // SDK already loaded – just render button
      try {
        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'donate' },
          createOrder: (data, actions) => actions.order.create({
            purchase_units: [{ amount: { value: '5.00', currency_code: 'USD' }, description: 'SimpleATC Donation' }]
          }),
          onApprove: (data, actions) => actions.order.capture().then(() => setDonationComplete(true)),
          onError: (err) => {
            console.error('PayPal error', err);
            setError('Payment could not be processed. Please try again.');
          }
        }).render(paypalContainerRef.current);
      } catch (err) {
        console.error('PayPal render error', err);
      }
      return;
    }

    if (document.querySelector('#paypal-sdk')) return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_PAYPAL_CLIENT_ID is not set – PayPal donation button will not load');
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=credit,card`;
    script.onload = () => {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'donate' },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: '5.00', currency_code: 'USD' }, description: 'SimpleATC Donation' }]
          });
        },
        onApprove: (data, actions) => actions.order.capture().then(() => {
          setDonationComplete(true);
        }),
        onError: (err) => {
          console.error('PayPal error', err);
          setError('Payment could not be processed. Please try again.');
        }
      }).render(paypalContainerRef.current);
    };
    document.body.appendChild(script);
  }, [mode, donationComplete]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && donationComplete && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Preferred Callsign
                </label>
                <input
                  type="text"
                  value={preferredCallsign}
                  onChange={(e) => setPreferredCallsign(e.target.value)}
                  placeholder="e.g., November 1234"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </>
          )}

          {mode === 'signup' && !donationComplete && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px', textAlign: 'center' }}>
                To support AI API costs, a one-time $5 donation is required to create an account.
              </p>
              <div ref={paypalContainerRef}></div>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                After your donation is approved, the account creation form will appear and you will recieve access to 500 AI scenarios, Simbrief Integration, Progress Tracker, and more.
              </p>
            </div>
          )}

          {(!mode === 'signup' || donationComplete) && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #dee2e6',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}

          {(!mode === 'signup' || donationComplete) && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #dee2e6',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
              {mode === 'signup' && (
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  Password must be at least 6 characters
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px',
              backgroundColor: error.includes('email') ? '#d4edda' : '#f8d7da',
              color: error.includes('email') ? '#155724' : '#721c24',
              border: `1px solid ${error.includes('email') ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '5px',
              marginBottom: '15px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {((mode === 'signup' && donationComplete) || mode === 'signin') && (
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          )}
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: '#666' }}>
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={switchMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 