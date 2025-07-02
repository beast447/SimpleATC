import React from 'react';
import { scenarioTypes } from '../data/scenarios';

const ScenarioSelector = ({ selectedType, onTypeChange, onNewScenario }) => {
  return (
    <div className="scenario-selector">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select 
          value={selectedType} 
          onChange={(e) => onTypeChange(e.target.value)}
          style={{ flex: '1', minWidth: '200px' }}
        >
          {scenarioTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <button 
          className="btn btn-primary" 
          onClick={onNewScenario}
          style={{ whiteSpace: 'nowrap' }}
        >
          New Scenario
        </button>
      </div>
    </div>
  );
};

export default ScenarioSelector; 