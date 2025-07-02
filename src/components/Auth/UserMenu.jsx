import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProgressModal from '../Progress/ProgressModal';

const UserMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  const openProgressModal = () => {
    setIsProgressModalOpen(true);
    setIsDropdownOpen(false);
  };

  if (!user) return null;

  const displayName = userProfile?.display_name || user.email.split('@')[0];
  const preferredCallsign = userProfile?.preferred_callsign || 'No callsign set';

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span>��</span>
          {displayName}
          <span style={{ 
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            ▼
          </span>
        </button>

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '5px',
            background: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '200px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #f0f0f0',
              background: '#f8f9fa'
            }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                {user.email}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                Callsign: {preferredCallsign}
              </div>
            </div>

            <button
              onClick={openProgressModal}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem',
                color: '#333',
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              <span>📊</span>
              View Progress
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // Settings functionality to be added later
              }}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem',
                color: '#333',
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              <span>⚙️</span>
              Settings
            </button>

            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem',
                color: '#dc3545'
              }}
              onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              <span>🚪</span>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Progress Modal */}
      <ProgressModal 
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
      />
    </>
  );
};

export default UserMenu; 