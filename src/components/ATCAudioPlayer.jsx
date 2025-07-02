import React, { useRef } from 'react';

// Simple player for pre-recorded ATC audio clips
const ATCAudioPlayer = ({ src, onEnded }) => {
  const audioRef = useRef(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '15px 0' }}>
      <button className="btn btn-primary" onClick={handlePlay} disabled={!src}>
        ▶️ Play ATC Call
      </button>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} onEnded={onEnded} preload="auto" />
    </div>
  );
};

export default ATCAudioPlayer; 