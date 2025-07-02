import React, { useState, useRef } from 'react';

const TTSAudio = ({ text = '', onEnded }) => {
  const utteranceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (!text) return;
    if (isPlaying) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // slower for clarity
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
      if (onEnded) onEnded();
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (utteranceRef.current && isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '15px 0' }}>
      <button className="btn btn-primary" onClick={handlePlay} disabled={!text || isPlaying} style={{ marginRight: '10px' }}>
        ▶️ Play ATC Call
      </button>
      <button className="btn btn-secondary" onClick={handleStop} disabled={!isPlaying}>
        ⏹ Stop
      </button>
    </div>
  );
};

export default TTSAudio; 