import React from 'react';

const SplashScreen = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '15px', color: '#667eea' }}>Welcome to SimpleATC</h2>
        <p style={{ marginBottom: '20px', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Free users can practice with our library of <strong>static ATC scenarios</strong> and basic
          scoring. Support development with a <strong>$5 one-time donation</strong> to unlock:
        </p>
        <ul style={{ textAlign: 'left', margin: '0 auto 20px', maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.4 }}>
          <li>Up to 500 <strong>AI-generated scenarios</strong></li>
          <li>ICAO/FAA phraseology toggle</li>
          <li>SimBrief route integration (coming soon)</li>
          <li>Progress tracking & analytics</li>
          <li>Priority feature requests & support</li>
        </ul>
        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '25px' }}>
          Your donation helps cover OpenAI API and hosting costs so we can keep improving the trainer.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 22px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default SplashScreen; 