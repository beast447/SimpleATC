import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateAIScenario, mergeCallsignIntoScenario } from '../services/openaiService';
import { getRandomScenario } from '../data/scenarios';
import { scoreResponse } from '../utils/scoring';
import { useAuth } from '../contexts/AuthContext';
import { trainingService } from '../services/trainingService';
import ScenarioSelector from './ScenarioSelector';
import SpeechInput from './SpeechInput';
import ScoreDisplay from './ScoreDisplay';
import ATCAudioPlayer from './ATCAudioPlayer';
import { useCallsign } from '../contexts/CallsignContext';
import { transformScenarioPhraseology } from '../utils/phraseology';
import TopUpModal from './TopUpModal';
import { aiUsageService } from '../services/aiUsageService';

const ATCScenario = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [scoreResult, setScoreResult] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalAttempts: 0,
    totalScore: 0,
    bestScore: 0
  });

  // Database integration state
  const [currentSession, setCurrentSession] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // For showing save feedback

  
  const [isCreatingSession, setIsCreatingSession] = useState(false); // Prevent multiple session creations
  const [hasScoredCurrentAttempt, setHasScoredCurrentAttempt] = useState(false); // Prevent double counting
  const [forceStopSpeech, setForceStopSpeech] = useState(false); // Force stop speech recognition
  const [audioFinished, setAudioFinished] = useState(false); // control when user can respond
  
  const { user } = useAuth();
  const sessionStartTime = useRef(new Date());
  const hasInitializedSession = useRef(false); // Track if we've already tried to create a session

  const sessionStatsRef = useRef(sessionStats);
  useEffect(() => {
    sessionStatsRef.current = sessionStats;
  }, [sessionStats]);

  const { callsign, phraseology } = useCallsign();

  // Listen for progress reset events
  useEffect(() => {
    const handleProgressReset = () => {
      console.log('🔄 Progress reset detected, clearing current session');
      setCurrentSession(null);
      hasInitializedSession.current = false;
      sessionStartTime.current = new Date();
    };

    window.addEventListener('progressReset', handleProgressReset);
    return () => window.removeEventListener('progressReset', handleProgressReset);
  }, []);

  // Create a new session when component mounts (for logged in users)
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🔍 initializeSession called with:', { user: !!user, currentSession: !!currentSession, isCreatingSession, hasInitialized: hasInitializedSession.current });
      
      if (user && !currentSession && !isCreatingSession && !hasInitializedSession.current) {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
          console.log('❌ Supabase not configured - skipping session creation');
          hasInitializedSession.current = true;
          return;
        }
        
        hasInitializedSession.current = true;
        setIsCreatingSession(true);
        console.log('✅ Creating new training session for user:', user.id);
        
        try {
          const { data: session, error } = await trainingService.createSession(user.id);
          if (session && !error) {
            setCurrentSession(session);
            sessionStartTime.current = new Date();
            console.log('✅ Created new training session:', session.id);
          } else {
            console.error('❌ Failed to create session:', error);
          }
        } catch (error) {
          console.error('❌ Error creating session:', error);
        } finally {
          setIsCreatingSession(false);
        }
      }
    };

    initializeSession();
  }, [user]); // Only depend on user changes

  // Helper to fetch a new scenario via OpenAI service
  const loadScenario = useCallback(async (type) => {
    setLoadingScenario(true);
    try {
      let scenario;
      if (user) {
        const remaining = await aiUsageService.getRemaining(user.id);

        if (remaining <= 0) {
          setShowTopUp(true);
          scenario = mergeCallsignIntoScenario(getRandomScenario(type), callsign);
        } else {
          scenario = await generateAIScenario(type, callsign, phraseology || 'FAA');
          await aiUsageService.increment(user.id);
        }
      } else {
        scenario = mergeCallsignIntoScenario(getRandomScenario(type), callsign);
      }

      // Adjust phraseology (static or AI) to match user preference
      scenario = transformScenarioPhraseology(scenario, phraseology);

      setCurrentScenario(scenario);
    } catch (err) {
      console.error('❌ Failed to load scenario:', err);
    } finally {
      setLoadingScenario(false);
    }
  }, [callsign, phraseology, user]);

  // Initial load
  useEffect(() => {
    if (callsign) {
      loadScenario(selectedType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callsign]);

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    if (callsign) {
      loadScenario(newType);
    }
    resetSession();
    setAudioFinished(false);
  };

  const handleNewScenario = () => {
    console.log('🔍 Loading new scenario - ensuring speech recognition is stopped');
    setForceStopSpeech(true); // Trigger force stop
    if (callsign) {
      loadScenario(selectedType);
    }
    resetSession();
    // Reset the force stop flag after a short delay
    setTimeout(() => setForceStopSpeech(false), 100);

    // Reset audioFinished for new scenario
    setAudioFinished(false);
  };

  const resetSession = () => {
    setTranscript('');
    setScoreResult(null);
    setShowScore(false);
    setSaveStatus('');
    setHasScoredCurrentAttempt(false); // Reset the scoring flag for new attempts
  };

  const handleTranscriptChange = useCallback((newTranscript) => {
    setTranscript(newTranscript);
    if (showScore && newTranscript !== transcript) {
      setShowScore(false);
      setScoreResult(null);
    }
  }, [transcript, showScore]);

  const saveAttemptToDatabase = async (finalTranscript, result, currentStats) => {
    console.log('🔍 saveAttemptToDatabase called with:', { 
      user: !!user, 
      currentSession: !!currentSession,
      sessionId: currentSession?.id,
      transcriptLength: finalTranscript?.length,
      score: result?.score
    });
    
    if (!user || !currentSession) {
      console.log('❌ Skipping database save - no user or session');
      return;
    }

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
      console.log('❌ Supabase not configured - running in demo mode');
      setSaveStatus('💡 Demo mode - no database connection');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving...');

    try {
      // Save the individual attempt
      const attemptData = {
        sessionId: currentSession.id,
        userId: user.id,
        scenarioId: currentScenario.id,
        scenarioType: currentScenario.type,
        atcCall: currentScenario.atc_call,
        userResponse: finalTranscript,
        expectedKeywords: currentScenario.expected_keywords,
        score: result.score,
        missingElements: result.missing,
        presentElements: result.present
      };

      const { error: attemptError } = await trainingService.saveAttempt(attemptData);
      
      if (attemptError) {
        throw new Error('Failed to save attempt: ' + attemptError.message);
      }

      // Calculate session stats for database (using the updated stats passed in)
      const newStats = {
        totalAttempts: currentStats.totalAttempts,
        averageScore: Math.round(currentStats.totalScore / currentStats.totalAttempts),
        bestScore: currentStats.bestScore,
        scenariosCompleted: currentStats.totalAttempts, // Simple count for now
        durationMinutes: Math.round((new Date() - sessionStartTime.current) / (1000 * 60))
      };

      const { error: sessionError } = await trainingService.updateSession(currentSession.id, newStats);
      
      if (sessionError) {
        throw new Error('Failed to update session: ' + sessionError.message);
      }

      // Update profile stats in background
      trainingService.updateProfileStats(user.id);

      setSaveStatus('✅ Progress saved!');
      setTimeout(() => setSaveStatus(''), 3000);

    } catch (error) {
      console.error('Error saving attempt:', error);
      setSaveStatus('❌ Save failed');
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSpeechComplete = useCallback(async (finalTranscript) => {
    if (forceStopSpeech) {
      console.log('🔍 Speech complete ignored due to force stop');
      return;
    }

    console.log('🔍 handleSpeechComplete called with:', { 
      transcript: finalTranscript, 
      user: !!user, 
      currentSession: !!currentSession,
      userSessionId: currentSession?.id,
      hasScoredCurrentAttempt
    });
    
    if (finalTranscript.trim() && !hasScoredCurrentAttempt) {
      const result = scoreResponse(currentScenario.expected_keywords, finalTranscript);
      console.log('🔍 Speech scored:', { score: result.score, present: result.present, missing: result.missing });
      
      setScoreResult(result);
      setShowScore(true);
      
      // Calculate new stats synchronously
      const newStats = {
        totalAttempts: sessionStats.totalAttempts + 1,
        totalScore: sessionStats.totalScore + result.score,
        bestScore: Math.max(sessionStats.bestScore, result.score)
      };
      console.log('🔍 Calculated new stats:', newStats);
      
      // Update session stats
      setSessionStats(newStats);
      setHasScoredCurrentAttempt(true); // Mark this attempt as scored

      // Don't save to database automatically - wait for user to click stop recording
      console.log('🔍 Speech completed - waiting for user to click stop recording to save');
    } else if (hasScoredCurrentAttempt) {
      console.log('🔍 Attempt already scored - skipping duplicate scoring');
    }
  }, [currentScenario, user, currentSession, sessionStats, hasScoredCurrentAttempt, forceStopSpeech]);

  const handleManualSave = useCallback(async () => {
    if (!transcript.trim()) {
      console.log('❌ No transcript to save');
      return;
    }

    console.log('🔍 handleManualSave called - saving attempt to database');
    
    // Ensure we have a score result (calculate if needed)
    let result = scoreResult;
    if (!result) {
      console.log('🔍 Re-scoring response for manual save (state not yet updated)');
      result = scoreResponse(currentScenario.expected_keywords, transcript);
    }
    
    // Use the latest session stats from ref (ensures we include the most recent attempt)
    const latestStats = sessionStatsRef.current;
    const currentStats = {
      totalAttempts: latestStats.totalAttempts,
      totalScore: latestStats.totalScore,
      bestScore: latestStats.bestScore
    };

    if (user && currentSession) {
      console.log('🔍 Attempting to save to database...');
      await saveAttemptToDatabase(transcript, result, currentStats);
    } else {
      console.log('🔍 Skipping database save:', { 
        hasUser: !!user, 
        hasSession: !!currentSession
      });
    }
  }, [transcript, scoreResult, user, currentSession, currentScenario]);

  const handleScoreNow = () => {
    if (transcript.trim()) {
      handleSpeechComplete(transcript);
      // Also save to database when manually scoring
      handleManualSave();
    }
  };

  const averageScore = sessionStats.totalAttempts > 0 
    ? Math.round(sessionStats.totalScore / sessionStats.totalAttempts) 
    : 0;

  const [showTopUp, setShowTopUp] = useState(false);

  if (!callsign || !phraseology) {
    return null; // Wait until callsign selected, modal is visible
  }

  if (loadingScenario || !currentScenario) {
    return (
      <div className="scenario-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        Loading scenario...
      </div>
    );
  }

  return (
    <div className="scenario-container">
      <ScenarioSelector 
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        onNewScenario={handleNewScenario}
      />

      {/* Session Stats */}
      {sessionStats.totalAttempts > 0 && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '5px', 
          margin: '20px 0',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '0.9rem'
        }}>
          <div><strong>Attempts:</strong> {sessionStats.totalAttempts}</div>
          <div><strong>Average:</strong> {averageScore}%</div>
          <div><strong>Best:</strong> {sessionStats.bestScore}%</div>
          {user && (
            <div style={{ color: '#007bff' }}>
              {saveStatus && <span>{saveStatus}</span>}
              {!saveStatus && '💾 Auto-saving'}
            </div>
          )}
        </div>
      )}

      {/* ATC Call Display */}
      <div className="atc-call">
        <div className="atc-label">ATC says:</div>
        <div>"{currentScenario.atc_call}"</div>
      </div>

      {/* Audio playback if available */}
      {currentScenario.audioUrl && (
        <ATCAudioPlayer src={currentScenario.audioUrl} onEnded={() => setAudioFinished(true)} />
      )}

      {/* Notice to play audio first */}
      {currentScenario.audioUrl && !audioFinished && (
        <div style={{ textAlign: 'center', color: '#dc3545', marginBottom: '10px' }}>
          ▶️ Please listen to the ATC call before responding
        </div>
      )}

      {/* Speech Input Section */}
      <SpeechInput 
        onTranscriptChange={handleTranscriptChange}
        onSpeechComplete={handleSpeechComplete}
        onStopRecording={handleManualSave}
        forceStop={forceStopSpeech}
        expectedKeywords={currentScenario.expected_keywords}
        disabled={currentScenario.audioUrl ? !audioFinished : false}
      />

      {/* Manual Score Button */}
      {transcript && !showScore && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleScoreNow}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Score My Response'}
          </button>
        </div>
      )}

      {/* Score Display */}
      <ScoreDisplay 
        scoreResult={scoreResult}
        scenario={currentScenario}
        isVisible={showScore}
      />

      {/* Try Again Button */}
      {showScore && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button className="btn btn-secondary" onClick={resetSession}>
            Try This Scenario Again
          </button>
        </div>
      )}

      {/* Scenario Info */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '5px',
        fontSize: '0.9rem',
        color: '#6c757d'
      }}>
        <strong>Scenario Type:</strong> {currentScenario.type.replace('_', ' ').toUpperCase()}
        <br />
        <strong>Expected Elements:</strong> {currentScenario.expected_keywords.join(', ')}
        {user && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', fontStyle: 'italic' }}>
            💡 Your progress is being automatically saved to your account
          </div>
        )}
      </div>

      {showTopUp && <TopUpModal isOpen={showTopUp} onClose={(reset) => { setShowTopUp(false); if (reset) { /* reload scenario */ loadScenario(selectedType); } }} />}
    </div>
  );
};

export default ATCScenario; 