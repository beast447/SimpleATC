import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { trainingService } from '../../services/trainingService';
import { supabase } from '../../lib/supabase';

const ProgressModal = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load user stats and sessions in parallel
      const [statsResult, sessionsResult] = await Promise.all([
        trainingService.getUserStats(user.id),
        trainingService.getUserSessions(user.id, 20)
      ]);

      if (statsResult.error) throw new Error(statsResult.error.message);
      if (sessionsResult.error) throw new Error(sessionsResult.error.message);

      setStats(statsResult.data);
      setSessions(sessionsResult.data || []);
      
    } catch (err) {
      setError(err.message);
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#198754'; // Darker green for better contrast
    if (score >= 75) return '#fd7e14'; // Orange instead of yellow for better readability
    return '#dc3545'; // Keep red as is
  };

  const getScenarioTypeLabel = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const resetAllProgress = async () => {
    if (!user) return;
    
    setResetting(true);
    try {
      // Use database function to delete all user data (bypasses RLS)
      const { data: deleteResult, error: deleteError } = await supabase
        .rpc('delete_user_progress', { user_id_param: user.id });
      
      if (deleteError) {
        throw new Error('Failed to delete user data');
      }

      // Reload data
      await loadUserData();
      setShowResetConfirm(false);
      
      // Clear any cached session data by dispatching a custom event
      window.dispatchEvent(new CustomEvent('progressReset'));
      
    } catch (error) {
      console.error('Error resetting progress:', error);
      setError('Failed to reset progress. Please try again.');
    } finally {
      setResetting(false);
    }
  };

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
        borderRadius: '15px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0' }}>📊 Training Progress</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              {stats?.profile?.display_name || user?.email?.split('@')[0]}'s Progress Dashboard
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowResetConfirm(true)}
              disabled={resetting}
              style={{
                background: 'rgba(220, 53, 69, 0.8)',
                border: '1px solid rgba(220, 53, 69, 0.9)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '0.8rem',
                cursor: resetting ? 'not-allowed' : 'pointer',
                opacity: resetting ? 0.6 : 1
              }}
            >
              {resetting ? 'Resetting...' : '🗑️ Reset Progress'}
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #dee2e6',
          background: '#f8f9fa'
        }}>
          {[
            { id: 'overview', label: '📈 Overview' },
            { id: 'sessions', label: '📝 Session History' },
            { id: 'analytics', label: '🎯 Performance Analytics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '15px',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#0d6efd' : 'black',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                borderBottom: activeTab === tab.id ? '2px solid #0d6efd' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '20px 30px' 
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '1.2rem', color: 'black' }}>Loading your progress...</div>
            </div>
          )}

          {error && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#dc3545'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>❌ Error Loading Data</div>
              <div>{error}</div>
                              <button 
                  onClick={loadUserData}
                  style={{
                    marginTop: '15px',
                    padding: '8px 16px',
                    background: '#0d6efd',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
            </div>
          )}

          {!loading && !error && stats && (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats.profile?.total_sessions || 0}
                      </div>
                      <div>Training Sessions</div>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #0d6efd, #6f42c1)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats.profile?.total_attempts || 0}
                      </div>
                      <div>Total Attempts</div>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats.profile?.average_score || 0}%
                      </div>
                      <div>Average Score</div>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #dc3545, #e83e8c)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats.profile?.best_score || 0}%
                      </div>
                      <div>Best Score</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <h3>Recent Activity</h3>
                  {stats.recentAttempts?.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                      {stats.recentAttempts.slice(0, 10).map((attempt, index) => (
                        <div key={attempt.id} style={{
                          padding: '10px',
                          border: '1px solid #dee2e6',
                          borderRadius: '5px',
                          marginBottom: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: 'black' }}>
                              {getScenarioTypeLabel(attempt.scenario_type)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'black' }}>
                              {formatDate(attempt.attempt_time)}
                            </div>
                          </div>
                          <div style={{
                            padding: '5px 10px',
                            borderRadius: '15px',
                            color: 'white',
                            fontWeight: 'bold',
                            background: getScoreColor(attempt.score)
                          }}>
                            {attempt.score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'black', fontStyle: 'italic' }}>
                      No recent activity. Start practicing to see your progress here!
                    </p>
                  )}
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div>
                  <h3>Session History</h3>
                  {sessions.length > 0 ? (
                    <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                      {sessions.map(session => (
                        <div key={session.id} style={{
                          padding: '15px',
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          marginBottom: '15px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px'
                          }}>
                            <div style={{ fontWeight: 'bold', color: 'black' }}>
                              {formatDate(session.session_date)}
                            </div>
                            <div style={{
                              padding: '3px 8px',
                              background: getScoreColor(session.average_score),
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '0.8rem'
                            }}>
                              Avg: {session.average_score}%
                            </div>
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '10px',
                            fontSize: '0.9rem',
                            color: 'black'
                          }}>
                            <div>Attempts: {session.total_attempts}</div>
                            <div>Best: {session.best_score}%</div>
                            <div>Duration: {session.session_duration_minutes}m</div>
                            <div>Scenarios: {session.scenarios_completed}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'black', fontStyle: 'italic' }}>
                      No training sessions yet. Complete some scenarios to see your session history!
                    </p>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h3>Performance by Scenario Type</h3>
                  {stats.statsByType && Object.keys(stats.statsByType).length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px'
                    }}>
                      {Object.entries(stats.statsByType).map(([type, typeStats]) => (
                        <div key={type} style={{
                          padding: '20px',
                          border: '1px solid #dee2e6',
                          borderRadius: '10px',
                          background: 'white'
                        }}>
                          <h4 style={{ margin: '0 0 15px 0', color: 'black' }}>
                            {getScenarioTypeLabel(type)}
                          </h4>
                          <div style={{ marginBottom: '10px', color: 'black'}}>
                            <strong>Attempts:</strong> {typeStats.totalAttempts}
                          </div>
                          <div style={{ marginBottom: '10px', color: 'black' }}>
                            <strong>Average:</strong> 
                            <span style={{ 
                              color: getScoreColor(typeStats.averageScore),
                              fontWeight: 'bold',
                              marginLeft: '5px'
                            }}>
                              {typeStats.averageScore}%
                            </span>
                          </div>
                          <div style={{ color: 'black' }}>
                            <strong>Best Score:</strong> 
                            <span style={{ 
                              color: getScoreColor(typeStats.bestScore),
                              fontWeight: 'bold',
                              marginLeft: '5px'
                            }}>
                              {typeStats.bestScore}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'black', fontStyle: 'italic' }}>
                      No analytics data yet. Practice more scenarios to see detailed performance breakdowns!
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '30px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 15px 0', color: 'black' }}>Reset All Progress?</h3>
            <p style={{ margin: '0 0 25px 0', color: 'black', lineHeight: '1.5' }}>
              This will permanently delete all your training sessions, attempts, and statistics. 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: resetting ? 'not-allowed' : 'pointer',
                  opacity: resetting ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button 
                onClick={resetAllProgress}
                disabled={resetting}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: resetting ? 'not-allowed' : 'pointer',
                  opacity: resetting ? 0.6 : 1
                }}
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressModal; 