import React, { useEffect, useRef, useState } from 'react';
import { aiUsageService } from '../services/aiUsageService';
import { useAuth } from '../contexts/AuthContext';

const TopUpModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const paypalRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;

    const renderButton = () => {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'donate' },
        createOrder: (data, actions) => actions.order.create({
          purchase_units: [{ amount: { value: '5.00', currency_code: 'USD' }, description: 'SimpleATC AI Scenario Top-up' }]
        }),
        onApprove: (data, actions) => actions.order.capture().then(async () => {
          await aiUsageService.reset(user.id);
          onClose(true); // indicate reset
        }),
        onError: (err) => {
          console.error('PayPal top-up error', err);
          setError('Payment error. Please try again.');
        }
      }).render(paypalRef.current);
    };

    if (window.paypal) {
      renderButton();
    } else if (!document.querySelector('#paypal-sdk')) {
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=credit,card`;
      script.onload = renderButton;
      document.body.appendChild(script);
    }
  }, [isOpen, user, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
    }}>
      <div style={{ background: 'white', padding: 30, borderRadius: 10, width: '90%', maxWidth: 400, textAlign: 'center' }}>
        <h3>Top-up AI Scenarios</h3>
        <p style={{ fontSize: '0.9rem' }}>Donate $5 to reset your AI scenario quota to 500.</p>
        <div ref={paypalRef}></div>
        {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p> }
        <button onClick={() => onClose(false)} style={{ marginTop: 15, background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
};

export default TopUpModal; 