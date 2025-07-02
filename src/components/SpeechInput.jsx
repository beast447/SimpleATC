import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const SpeechInput = ({ onTranscriptChange, onSpeechComplete, onStopRecording, forceStop, disabled = false, expectedKeywords = [] }) => {
  const [micTestResult, setMicTestResult] = React.useState('');
  const [isTesting, setIsTesting] = React.useState(false);
  const [volumeLevel, setVolumeLevel] = React.useState(0);
  const [isMonitoringVolume, setIsMonitoringVolume] = React.useState(false);
  
  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const wasManualStop = React.useRef(false); // Track if stop was manual
  
  const {
    isListening,
    transcript,
    isSupported,
    error,
    debugInfo,
    toggleListening,
    resetTranscript
  } = useSpeechRecognition(expectedKeywords);

  // Handle force stop from parent component
  React.useEffect(() => {
    if (forceStop) {
      console.log('🔍 Force stopping speech recognition due to new scenario');
      wasManualStop.current = false; // Don't trigger save when force stopping
      
      // Stop speech recognition if it's currently active
      if (isListening) {
        toggleListening();
      }
      
      // Always clear the transcript when force stopping
      resetTranscript();
      onTranscriptChange(''); // Clear transcript in parent component
    }
  }, [forceStop, isListening, toggleListening, resetTranscript, onTranscriptChange]);

  // Call parent callback when transcript changes
  React.useEffect(() => {
    console.log('🔍 Transcript changed:', { transcript, isListening });
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  // Call parent callback when speech ends
  React.useEffect(() => {
    if (!isListening && transcript) {
      if (wasManualStop.current) {
        // User manually stopped - call both scoring and saving
        console.log('🔍 User manually stopped recording - calling onSpeechComplete first, then onStopRecording');
        onSpeechComplete && onSpeechComplete(transcript);
        // Small delay to ensure scoring happens before saving
        setTimeout(() => {
          onStopRecording && onStopRecording(transcript);
        }, 100);
        wasManualStop.current = false; // Reset the flag
      } else {
        // Speech ended automatically - call onSpeechComplete for scoring only
        console.log('🔍 Speech ended automatically - calling onSpeechComplete');
        onSpeechComplete && onSpeechComplete(transcript);
      }
    }
  }, [isListening, transcript, onSpeechComplete, onStopRecording]);

  // Start volume monitoring when listening starts
  React.useEffect(() => {
    if (isListening && !isMonitoringVolume) {
      startVolumeMonitoring();
    } else if (!isListening && isMonitoringVolume) {
      stopVolumeMonitoring();
    }
  }, [isListening]);

  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      setIsMonitoringVolume(true);
      
      const updateVolume = () => {
        if (isMonitoringVolume && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / bufferLength;
          const volumePercent = Math.round((average / 255) * 100);
          
          setVolumeLevel(volumePercent);
          
          if (isListening) {
            requestAnimationFrame(updateVolume);
          }
        }
      };
      
      updateVolume();
    } catch (err) {
      console.error('Error starting volume monitoring:', err);
    }
  };

  const stopVolumeMonitoring = () => {
    setIsMonitoringVolume(false);
    setVolumeLevel(0);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
  };

  const handleClearTranscript = () => {
    resetTranscript();
    onTranscriptChange('');
  };

  const handleToggleListening = () => {
    if (isListening) {
      // User is manually stopping recording
      wasManualStop.current = true;
      console.log('🔍 User clicked stop button - setting manual stop flag');
    }
    toggleListening();
  };

  const testMicrophone = async () => {
    setIsTesting(true);
    setMicTestResult('Testing...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicTestResult('✅ Microphone access granted! Hardware working correctly.');
      
      // Stop the stream after testing
      stream.getTracks().forEach(track => track.stop());
      
      setTimeout(() => {
        setMicTestResult('');
      }, 5000);
    } catch (error) {
      let errorMsg = '❌ Microphone test failed: ';
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Permission denied. Please allow microphone access.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No microphone found. Please connect a microphone.';
      } else if (error.name === 'NotReadableError') {
        errorMsg += 'Microphone is being used by another application.';
      } else {
        errorMsg += error.message;
      }
      setMicTestResult(errorMsg);
    }
    
    setIsTesting(false);
  };

  if (!isSupported) {
    return (
      <div className="speech-section">
        <div className="status-message error">
          Speech recognition is not supported in this browser. 
          Please try Chrome, Edge, or Safari.
        </div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
          Debug: {debugInfo}
        </div>
      </div>
    );
  }

  return (
    <div className="speech-section">
      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={handleToggleListening}
          disabled={!isSupported || disabled}
          title={isListening ? 'Click to stop recording' : 'Click to start recording'}
        >
          {isListening ? '🔴' : '🎤'}
        </button>
      </div>
      
      {/* Volume Level Indicator */}
      {isListening && (
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
            Microphone Volume: {volumeLevel}%
          </div>
          <div style={{
            width: '200px',
            height: '10px',
            backgroundColor: '#e0e0e0',
            borderRadius: '5px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${volumeLevel}%`,
              height: '100%',
              backgroundColor: volumeLevel > 30 ? '#28a745' : volumeLevel > 10 ? '#ffc107' : '#dc3545',
              transition: 'width 0.1s ease'
            }}></div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
            {volumeLevel > 30 ? '✅ Good volume' : volumeLevel > 10 ? '⚠️ Low volume - speak louder' : '❌ Very low - check mic'}
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <strong>
          {isListening ? 'Listening... Speak your response' : 'Click the microphone to start'}
        </strong>
      </div>

      {/* Microphone Test Button */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={testMicrophone}
          disabled={isTesting || isListening}
          style={{ fontSize: '0.9rem' }}
        >
          {isTesting ? 'Testing...' : '🔧 Test Microphone'}
        </button>
      </div>

      {/* Microphone Test Result */}
      {micTestResult && (
        <div style={{ 
          fontSize: '0.9rem', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '10px',
          background: micTestResult.includes('✅') ? '#d4edda' : '#f8d7da',
          color: micTestResult.includes('✅') ? '#155724' : '#721c24',
          border: micTestResult.includes('✅') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
        }}>
          {micTestResult}
        </div>
      )}

      {/* Debug information */}
      {debugInfo && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#666', 
          background: '#f8f9fa', 
          padding: '8px', 
          borderRadius: '4px',
          marginBottom: '10px',
          fontFamily: 'monospace'
        }}>
          Debug: {debugInfo}
        </div>
      )}

      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}

      <div className={`transcript ${!transcript ? 'empty' : ''}`}>
        {transcript || 'Your speech will appear here...'}
      </div>

      {transcript && (
        <div className="controls">
          <button 
            className="btn btn-secondary" 
            onClick={handleClearTranscript}
          >
            Clear
          </button>
        </div>
      )}

      {/* Troubleshooting tips */}
      <div style={{ 
        marginTop: '20px', 
        fontSize: '0.9rem', 
        color: '#666',
        background: '#e7f3ff',
        padding: '15px',
        borderRadius: '5px'
      }}>
        <strong>Troubleshooting Tips:</strong>
        <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
          <li>First, try the "Test Microphone" button above</li>
          <li>Watch the volume indicator when speaking - aim for green levels</li>
          <li>Speak clearly and at normal volume (not too quiet, not shouting)</li>
          <li>Make sure you're close enough to your microphone (6-12 inches)</li>
          <li>Try refreshing the page if you're having issues</li>
          <li>Use Chrome, Edge, or Safari for best results</li>
          <li>Check your browser's site settings for microphone permissions</li>
          <li>Make sure no other apps are using your microphone</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechInput; 