import React from 'react';
import { getScoreCategory, generateDetailedFeedback } from '../utils/scoring';

const ScoreDisplay = ({ scoreResult, scenario, isVisible }) => {
  if (!isVisible || !scoreResult) {
    return null;
  }

  const { score, matches, total, missing, present, feedback } = scoreResult;
  const category = getScoreCategory(score);
  const detailedFeedback = generateDetailedFeedback(missing, present, scenario.type);

  return (
    <div className={`score-display ${category}`}>
      <h3>Score: {score}%</h3>
      <p>{feedback}</p>
      
      <div className="score-details">
        <p><strong>Elements Found:</strong> {matches} of {total}</p>
        
        {missing.length > 0 && (
          <div className="missing-keywords">
            <p><strong>Missing Elements:</strong></p>
            {missing.map((keyword, index) => (
              <span key={index}>{keyword}</span>
            ))}
          </div>
        )}

        {detailedFeedback.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <p><strong>Tips for improvement:</strong></p>
            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
              {detailedFeedback.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="perfect-response">
        <div className="perfect-response-label">Perfect Response:</div>
        <div style={{ fontFamily: 'Courier New, monospace' }}>
          "{scenario.perfect_response}"
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay; 