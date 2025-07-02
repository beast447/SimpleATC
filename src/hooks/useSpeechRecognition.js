import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechRecognition = (grammarWords = []) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);
    
    if (!supported) {
      setError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      setDebugInfo('Browser: ' + navigator.userAgent);
    } else {
      setDebugInfo('Speech recognition available');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
    setDebugInfo('Transcript cleared');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const startListening = useCallback(async () => {
    setDebugInfo('Starting speech recognition...');
    
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      setDebugInfo('Not supported');
      return;
    }

    // Check microphone permissions first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream, we just needed to check permissions
      setDebugInfo('Microphone access granted');
    } catch (permissionError) {
      setError('Microphone access denied. Please allow microphone access and refresh the page.');
      setDebugInfo('Permission error: ' + permissionError.message);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Build dynamic grammar (JSGF) based on expected keywords
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SpeechGrammarList && grammarWords.length > 0) {
      const grammarList = new SpeechGrammarList();
      const uniqueWords = Array.from(new Set(grammarWords.map(w => w.toLowerCase())));
      const grammarBody = uniqueWords.join(' | ');
      const grammar = `#JSGF V1.0; grammar atc; public <word> = ${grammarBody};`;
      try {
        grammarList.addFromString(grammar, 1);
        recognition.grammars = grammarList;
        setDebugInfo(prev => prev + ' | Grammar loaded');
      } catch (err) {
        console.warn('Failed to load grammar:', err);
      }
    }

    // Configure speech recognition with better settings
    recognition.continuous = true;  // Keep listening for longer
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 5; // Let the engine provide up to 5 alternatives

    // Set a longer timeout for speech detection
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        setDebugInfo('Extended listening time - keep speaking...');
      }
    }, 10000); // 10 seconds

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setError(null);
      setDebugInfo('🎤 Listening... Start speaking clearly! (You have up to 30 seconds)');
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      setDebugInfo(prev => prev + ' | Recognition ended');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onspeechstart = () => {
      console.log('Speech detected');
      setDebugInfo('✅ Speech detected! Keep talking...');
    };

    recognition.onspeechend = () => {
      console.log('Speech ended');
      setDebugInfo(prev => prev + ' | Speech ended, processing...');
    };

    recognition.onaudiostart = () => {
      console.log('Audio capture started');
      setDebugInfo('🔊 Audio capture started - microphone is active');
    };

    recognition.onaudioend = () => {
      console.log('Audio capture ended');
      setDebugInfo(prev => prev + ' | Audio capture ended');
    };

    recognition.onsoundstart = () => {
      console.log('Sound detected');
      setDebugInfo('🔉 Sound detected from microphone');
    };

    recognition.onsoundend = () => {
      console.log('Sound ended');
      setDebugInfo(prev => prev + ' | Sound ended');
    };

    recognition.onresult = (event) => {
      console.log('Recognition result:', event);
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Choose the alternative with the highest confidence
        let bestAlt = event.results[i][0];
        for (let altIdx = 1; altIdx < event.results[i].length; altIdx++) {
          if (event.results[i][altIdx].confidence > bestAlt.confidence) {
            bestAlt = event.results[i][altIdx];
          }
        }
        const transcriptPart = bestAlt.transcript;
        const confidence = bestAlt.confidence;
        
        console.log(`Result ${i}: "${transcriptPart}" (confidence: ${confidence})`);
        
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
          setDebugInfo(`✅ Final: "${transcriptPart}" (confidence: ${Math.round(confidence * 100)}%)`);
        } else {
          interimTranscript += transcriptPart;
          setDebugInfo(`⏳ Interim: "${transcriptPart}"`);
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
      
      let errorMessage = '';
      let shouldRetry = false;
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Try speaking louder and closer to the microphone. Click "Record Again" to retry.';
          setDebugInfo('❌ Error: No speech detected - try speaking louder');
          shouldRetry = true;
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please ensure you have a microphone connected and try again.';
          setDebugInfo('❌ Error: Audio capture failed');
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings and refresh the page.';
          setDebugInfo('❌ Error: Permission denied');
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection.';
          setDebugInfo('❌ Error: Network issue');
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Please try a different browser or check your internet connection.';
          setDebugInfo('❌ Error: Service not allowed');
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was stopped.';
          setDebugInfo('❌ Error: Aborted');
          shouldRetry = true;
          break;
        case 'language-not-supported':
          errorMessage = 'Language not supported.';
          setDebugInfo('❌ Error: Language not supported');
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
          setDebugInfo(`❌ Error: ${event.error}`);
      }
      
      setError(errorMessage);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setDebugInfo('🚀 Recognition start attempted...');
    } catch (startError) {
      console.error('Failed to start recognition:', startError);
      setError('Failed to start speech recognition: ' + startError.message);
      setDebugInfo('❌ Start error: ' + startError.message);
    }
  }, [isSupported, isListening, grammarWords]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setDebugInfo(prev => prev + ' | 🛑 Stop requested');
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    debugInfo,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  };
}; 