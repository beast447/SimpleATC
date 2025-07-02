import React, { createContext, useContext, useState, useEffect } from 'react';

const CallsignContext = createContext({
  callsign: '',
  setCallsign: () => {},
  phraseology: '',
  setPhraseology: () => {}
});

export const CallsignProvider = ({ children }) => {
  const [callsign, setCallsignState] = useState('');
  const [phraseology, setPhraseologyState] = useState('');

  // Load persisted callsign on mount
  useEffect(() => {
    const stored = localStorage.getItem('simpleatc_callsign');
    if (stored) {
      setCallsignState(stored);
    }

    const storedPhrase = localStorage.getItem('simpleatc_phraseology');
    if (storedPhrase) {
      setPhraseologyState(storedPhrase);
    }
  }, []);

  const setCallsign = (value) => {
    setCallsignState(value);
    if (value) {
      localStorage.setItem('simpleatc_callsign', value);
    } else {
      localStorage.removeItem('simpleatc_callsign');
    }
  };

  const setPhraseology = (value) => {
    setPhraseologyState(value);
    if (value) {
      localStorage.setItem('simpleatc_phraseology', value);
    } else {
      localStorage.removeItem('simpleatc_phraseology');
    }
  };

  return (
    <CallsignContext.Provider value={{ callsign, setCallsign, phraseology, setPhraseology }}>
      {children}
    </CallsignContext.Provider>
  );
};

export const useCallsign = () => useContext(CallsignContext); 