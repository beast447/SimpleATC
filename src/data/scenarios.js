export const scenarios = [
  // Tower Departures
  {
    id: 1,
    type: 'tower_departure',
    atc_call: "November 1234, cleared for takeoff runway 27 Left",
    expected_keywords: ['cleared', 'takeoff', 'runway', '27', 'left', 'november', '1234'],
    perfect_response: "Cleared for takeoff runway 27 Left, November 1234"
  },
  {
    id: 2,
    type: 'tower_departure', 
    atc_call: "Spirit 892, wind 280 at 8, cleared for takeoff runway 28 Right",
    expected_keywords: ['cleared', 'takeoff', 'runway', '28', 'right', 'spirit', '892'],
    perfect_response: "Wind 280 at 8, cleared for takeoff runway 28 Right, Spirit 892"
  },
  {
    id: 3,
    type: 'tower_departure',
    atc_call: "American 1205, runway 34 Left, wind 350 at 12, cleared for takeoff",
    expected_keywords: ['cleared', 'takeoff', 'runway', '34', 'left', 'american', '1205'],
    perfect_response: "Runway 34 Left, wind 350 at 12, cleared for takeoff, American 1205"
  },
  
  // Ground Operations
  {
    id: 4,
    type: 'ground',
    atc_call: "November 1234, taxi to runway 27 Left via Alpha, Charlie",
    expected_keywords: ['taxi', 'runway', '27', 'left', 'alpha', 'charlie', 'november', '1234'],
    perfect_response: "Taxi to runway 27 Left via Alpha, Charlie, November 1234"
  },
  {
    id: 5,
    type: 'ground',
    atc_call: "United 456, contact ground 121.9, taxi to gate B12 via Bravo, Delta",
    expected_keywords: ['contact', 'ground', '121.9', 'taxi', 'gate', 'b12', 'bravo', 'delta', 'united', '456'],
    perfect_response: "Contact ground 121.9, taxi to gate B12 via Bravo, Delta, United 456"
  },
  {
    id: 6,
    type: 'ground',
    atc_call: "Delta 789, taxi to runway 22 Right via Echo, Foxtrot, hold short of runway 15",
    expected_keywords: ['taxi', 'runway', '22', 'right', 'echo', 'foxtrot', 'hold', 'short', '15', 'delta', '789'],
    perfect_response: "Taxi to runway 22 Right via Echo, Foxtrot, hold short of runway 15, Delta 789"
  },
  
  // Tower Arrivals/Pattern
  {
    id: 7,
    type: 'tower_arrival',
    atc_call: "November 1234, cleared to land runway 27 Left",
    expected_keywords: ['cleared', 'land', 'runway', '27', 'left', 'november', '1234'],
    perfect_response: "Cleared to land runway 27 Left, November 1234"
  },
  {
    id: 8,
    type: 'tower_arrival',
    atc_call: "Southwest 567, turn left base runway 34 Right, number 2 behind a Boeing 737",
    expected_keywords: ['turn', 'left', 'base', 'runway', '34', 'right', 'number', '2', 'southwest', '567'],
    perfect_response: "Turn left base runway 34 Right, number 2, Southwest 567"
  },
  
  // Approach Control
  {
    id: 9,
    type: 'approach',
    atc_call: "November 1234, descend and maintain 3000, turn left heading 270",
    expected_keywords: ['descend', 'maintain', '3000', 'turn', 'left', 'heading', '270', 'november', '1234'],
    perfect_response: "Descend and maintain 3000, turn left heading 270, November 1234"
  },
  {
    id: 10,
    type: 'approach',
    atc_call: "JetBlue 345, contact tower 119.1, good day",
    expected_keywords: ['contact', 'tower', '119.1', 'jetblue', '345'],
    perfect_response: "Contact tower 119.1, JetBlue 345, good day"
  },
  {
    id: 11,
    type: 'ifr_clearance',
    atc_call: "N/A Listen to Audio File",
    audioUrl: '/audio/ifr_clearance_1.wav',
    expected_keywords: ['cleared', 'fly', 'as', 'filed', 'wazy', 'radar', 'vectors', 'lazy', 'heading', 'as', 'filed', 'departure', 'squawk', '3363',],
    perfect_response: "Cleared to Destin Airport as filed, on departure fly runway heading, radar vectors wazy, then as filed, squawk 3363"
  }
];

export const scenarioTypes = [
  { value: 'all', label: 'All Scenarios' },
  { value: 'ifr_clearance', label: 'IFR Clearance' },
  { value: 'pushback', label: 'Pushback & Engine Start' },
  { value: 'taxi_out', label: 'Taxi Instructions (Departure)' },
  { value: 'takeoff', label: 'Takeoff Clearance' },
  { value: 'departure', label: 'Departure' },
  { value: 'center', label: 'Center' },
  { value: 'approach', label: 'Approach Control' },
  { value: 'arrival', label: 'Arrival' },
  { value: 'taxi_in', label: 'Taxi at Arrival' }
];

export const getScenariosByType = (type) => {
  if (type === 'all') return scenarios;
  return scenarios.filter(scenario => scenario.type === type);
};

export const getRandomScenario = (type = 'all') => {
  const availableScenarios = getScenariosByType(type);
  const pool = availableScenarios.length > 0 ? availableScenarios : scenarios; // Fallback to all if none
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}; 