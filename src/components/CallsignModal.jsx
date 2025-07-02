import React, { useState, useEffect } from 'react';
import { useCallsign } from '../contexts/CallsignContext';

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modalStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '400px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  textAlign: 'center'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  margin: '15px 0',
  fontSize: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  background: '#667eea',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem'
};

const CloseBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: 10,
      right: 12,
      background: 'transparent',
      border: 'none',
      color: '#888',
      fontSize: '1.4rem',
      cursor: 'pointer'
    }}
    aria-label="Close"
  >
    ×
  </button>
);

const CallsignModal = ({ isOpen, onClose }) => {
  const { callsign, setCallsign, phraseology, setPhraseology } = useCallsign();
  const [value, setValue] = useState(callsign || '');
  const [selectedPhrase, setSelectedPhrase] = useState(phraseology || 'FAA');

  // Reset local form when modal reopens
  useEffect(() => {
    setValue(callsign || '');
    setSelectedPhrase(phraseology || 'FAA');
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      setCallsign(value.trim());
      setPhraseology(selectedPhrase);
      onClose && onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <CloseBtn onClick={onClose} />
        <h2>Select Your Callsign</h2>
        <p style={{ fontSize: '0.9rem', color: '#555' }}>
          Enter the aircraft callsign you want to use for all scenarios.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g. November 1234"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px' }}>
              <input 
                type="radio" 
                name="phraseology" 
                value="FAA" 
                checked={selectedPhrase === 'FAA'}
                onChange={() => setSelectedPhrase('FAA')} 
              /> FAA
            </label>
            <label>
              <input 
                type="radio" 
                name="phraseology" 
                value="ICAO" 
                checked={selectedPhrase === 'ICAO'}
                onChange={() => setSelectedPhrase('ICAO')} 
              /> ICAO
            </label>
          </div>
          <button type="submit" style={buttonStyle} disabled={!value.trim()}>
            Save
          </button>
          {onClose && (
            <button type="button" style={{ ...buttonStyle, background: '#555', marginLeft: '10px' }} onClick={onClose}>
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CallsignModal; 