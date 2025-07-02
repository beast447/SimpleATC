export const scenarios = [
  /* ---------------- PUSHBACK & ENGINE START ---------------- */
  {
    id: 1,
    type: 'pushback',
    atc_call: "Delta 789, push and start approved, tail east on Alpha",
    expected_keywords: ['push', 'start', 'approved', 'tail', 'east', 'alpha', 'delta', '789'],
    perfect_response: "Push and start approved, tail east on Alpha, Delta 789"
  },
  {
    id: 2,
    type: 'pushback',
    atc_call: "United 456, expect runway 27, pushback approved, contact ground 121.9",
    expected_keywords: ['expect', 'runway', '27', 'pushback', 'approved', 'contact', 'ground', '121.9', 'united', '456'],
    perfect_response: "Expect runway 27, pushback approved, contact ground 121.9, United 456"
  },
  {
    id: 3,
    type: 'pushback',
    atc_call: "Spirit 892, pushback and engine start approved, face south",
    expected_keywords: ['pushback', 'engine', 'start', 'approved', 'face', 'south', 'spirit', '892'],
    perfect_response: "Pushback and engine start approved, face south, Spirit 892"
  },
  {
    id: 4,
    type: 'pushback',
    atc_call: "November 1234, push approved, expect taxi via Bravo",
    expected_keywords: ['push', 'approved', 'expect', 'taxi', 'bravo', 'november', '1234'],
    perfect_response: "Push approved, expect taxi via Bravo, November 1234"
  },
  {
    id: 5,
    type: 'pushback',
    atc_call: "JetBlue 345, pushback approved, tail north, monitor ground",
    expected_keywords: ['pushback', 'approved', 'tail', 'north', 'monitor', 'ground', 'jetblue', '345'],
    perfect_response: "Pushback approved, tail north, monitoring ground, JetBlue 345"
  },

  /* ---------------- TAXI OUT ---------------- */
  {
    id: 6,
    type: 'taxi_out',
    atc_call: "Delta 789, taxi to runway 27 via Alpha, hold short runway 22R",
    expected_keywords: ['taxi', 'runway', '27', 'alpha', 'hold', 'short', '22r', 'delta', '789'],
    perfect_response: "Taxi to runway 27 via Alpha, hold short runway 22 Right, Delta 789"
  },
  {
    id: 7,
    type: 'taxi_out',
    atc_call: "United 456, taxi to runway 9 Left via Bravo Charlie",
    expected_keywords: ['taxi', 'runway', '9', 'left', 'bravo', 'charlie', 'united', '456'],
    perfect_response: "Taxi to runway 9 Left via Bravo Charlie, United 456"
  },
  {
    id: 8,
    type: 'taxi_out',
    atc_call: "Spirit 892, taxi to runway 15 via Delta Echo, cross runway 10",
    expected_keywords: ['taxi', 'runway', '15', 'delta', 'echo', 'cross', '10', 'spirit', '892'],
    perfect_response: "Taxi to runway 15 via Delta Echo, cross runway 10, Spirit 892"
  },
  {
    id: 9,
    type: 'taxi_out',
    atc_call: "November 1234, taxi to runway 4 Right via Golf, hold short runway 4 Left",
    expected_keywords: ['taxi', 'runway', '4', 'right', 'golf', 'hold', 'short', 'left', 'november', '1234'],
    perfect_response: "Taxi to runway 4 Right via Golf, hold short runway 4 Left, November 1234"
  },
  {
    id: 10,
    type: 'taxi_out',
    atc_call: "JetBlue 345, taxi to runway 18 via Hotel Juliet, monitor tower 118.5",
    expected_keywords: ['taxi', 'runway', '18', 'hotel', 'juliet', 'monitor', 'tower', '118.5', 'jetblue', '345'],
    perfect_response: "Taxi to runway 18 via Hotel Juliet, monitoring tower 118.5, JetBlue 345"
  },

  /* ---------------- TAKEOFF CLEARANCE ---------------- */
  {
    id: 11,
    type: 'takeoff',
    atc_call: "Delta 789, wind 270 at 6, cleared for takeoff runway 27",
    expected_keywords: ['wind', '270', '6', 'cleared', 'takeoff', 'runway', '27', 'delta', '789'],
    perfect_response: "Wind 270 at 6, cleared for takeoff runway 27, Delta 789"
  },
  {
    id: 12,
    type: 'takeoff',
    atc_call: "United 456, runway 9 Left, cleared for takeoff, traffic departing parallel",
    expected_keywords: ['runway', '9', 'left', 'cleared', 'takeoff', 'traffic', 'departing', 'parallel', 'united', '456'],
    perfect_response: "Runway 9 Left, cleared for takeoff, traffic departing parallel, United 456"
  },
  {
    id: 13,
    type: 'takeoff',
    atc_call: "Spirit 892, winds calm, cleared for takeoff runway 15",
    expected_keywords: ['winds', 'calm', 'cleared', 'takeoff', 'runway', '15', 'spirit', '892'],
    perfect_response: "Winds calm, cleared for takeoff runway 15, Spirit 892"
  },
  {
    id: 14,
    type: 'takeoff',
    atc_call: "November 1234, cleared for takeoff runway 4 Right, fly heading 050",
    expected_keywords: ['cleared', 'takeoff', 'runway', '4', 'right', 'fly', 'heading', '050', 'november', '1234'],
    perfect_response: "Cleared for takeoff runway 4 Right, fly heading 050, November 1234"
  },
  {
    id: 15,
    type: 'takeoff',
    atc_call: "JetBlue 345, runway 18, cleared for takeoff, after departure contact departure 120.4",
    expected_keywords: ['runway', '18', 'cleared', 'takeoff', 'contact', 'departure', '120.4', 'jetblue', '345'],
    perfect_response: "Runway 18, cleared for takeoff, after departure contact departure 120.4, JetBlue 345"
  },

  /* ---------------- DEPARTURE ---------------- */
  {
    id: 16,
    type: 'departure',
    atc_call: "Delta 789, radar contact, climb and maintain 5000, turn left heading 240",
    expected_keywords: ['radar', 'contact', 'climb', 'maintain', '5000', 'turn', 'left', 'heading', '240', 'delta', '789'],
    perfect_response: "Radar contact, climb and maintain 5000, left heading 240, Delta 789"
  },
  {
    id: 17,
    type: 'departure',
    atc_call: "United 456, climb and maintain 7000, direct VUZ",
    expected_keywords: ['climb', 'maintain', '7000', 'direct', 'vuz', 'united', '456'],
    perfect_response: "Climb and maintain 7000, direct VUZ, United 456"
  },
  {
    id: 18,
    type: 'departure',
    atc_call: "Spirit 892, turn right heading 180, climb and maintain 4000",
    expected_keywords: ['turn', 'right', 'heading', '180', 'climb', 'maintain', '4000', 'spirit', '892'],
    perfect_response: "Right heading 180, climb and maintain 4000, Spirit 892"
  },
  {
    id: 19,
    type: 'departure',
    atc_call: "November 1234, contact departure 125.7, good day",
    expected_keywords: ['contact', 'departure', '125.7', 'good', 'day', 'november', '1234'],
    perfect_response: "Contact departure 125.7, November 1234, good day"
  },
  {
    id: 20,
    type: 'departure',
    atc_call: "JetBlue 345, climb and maintain 6000, proceed direct ZELMO",
    expected_keywords: ['climb', 'maintain', '6000', 'direct', 'zelmo', 'jetblue', '345'],
    perfect_response: "Climb and maintain 6000, direct ZELMO, JetBlue 345"
  },

  /* ---------------- CENTER ---------------- */
  {
    id: 21,
    type: 'center',
    atc_call: "Delta 789, climb and maintain flight level 230",
    expected_keywords: ['climb', 'maintain', 'flight', 'level', '230', 'delta', '789'],
    perfect_response: "Climb and maintain flight level 230, Delta 789"
  },
  {
    id: 22,
    type: 'center',
    atc_call: "United 456, traffic twelve o'clock, opposite direction, Boeing 737, flight level 240",
    expected_keywords: ['traffic', 'twelve', "o'clock", 'opposite', 'direction', 'boeing', '737', 'flight', 'level', '240', 'united', '456'],
    perfect_response: "Looking for traffic, United 456"
  },
  {
    id: 23,
    type: 'center',
    atc_call: "Spirit 892, proceed direct LIT, expect lower in 10 miles",
    expected_keywords: ['proceed', 'direct', 'lit', 'expect', 'lower', '10', 'miles', 'spirit', '892'],
    perfect_response: "Direct LIT, expect lower in 10 miles, Spirit 892"
  },
  {
    id: 24,
    type: 'center',
    atc_call: "November 1234, descend and maintain flight level 190, cross MEM at 250 knots",
    expected_keywords: ['descend', 'maintain', 'flight', 'level', '190', 'cross', 'mem', '250', 'knots', 'november', '1234'],
    perfect_response: "Descend and maintain flight level 190, cross MEM at 250 knots, November 1234"
  },
  {
    id: 25,
    type: 'center',
    atc_call: "JetBlue 345, contact Houston Center on 132.95",
    expected_keywords: ['contact', 'houston', 'center', '132.95', 'jetblue', '345'],
    perfect_response: "Contact Houston Center 132.95, JetBlue 345"
  },

  /* ---------------- APPROACH ---------------- */
  {
    id: 26,
    type: 'approach',
    atc_call: "Delta 789, descend and maintain 3000, turn left heading 270, intercept runway 27 localizer",
    expected_keywords: ['descend', 'maintain', '3000', 'turn', 'left', 'heading', '270', 'intercept', 'localizer', 'delta', '789'],
    perfect_response: "Descend and maintain 3000, left heading 270, intercept runway 27 localizer, Delta 789"
  },
  {
    id: 27,
    type: 'approach',
    atc_call: "United 456, reduce speed to 180 knots, descend and maintain 4000",
    expected_keywords: ['reduce', 'speed', '180', 'knots', 'descend', 'maintain', '4000', 'united', '456'],
    perfect_response: "Speed 180 knots, descend and maintain 4000, United 456"
  },
  {
    id: 28,
    type: 'approach',
    atc_call: "Spirit 892, turn right heading 090, vectors ILS runway 9 Left",
    expected_keywords: ['turn', 'right', 'heading', '090', 'vectors', 'ils', 'runway', '9', 'left', 'spirit', '892'],
    perfect_response: "Right heading 090, vectors ILS runway 9 Left, Spirit 892"
  },
  {
    id: 29,
    type: 'approach',
    atc_call: "November 1234, maintain 2500 until established, cleared ILS runway 15",
    expected_keywords: ['maintain', '2500', 'until', 'established', 'cleared', 'ils', 'runway', '15', 'november', '1234'],
    perfect_response: "Maintain 2500 until established, cleared ILS runway 15, November 1234"
  },
  {
    id: 30,
    type: 'approach',
    atc_call: "JetBlue 345, contact tower 119.1, good day",
    expected_keywords: ['contact', 'tower', '119.1', 'good', 'day', 'jetblue', '345'],
    perfect_response: "Contact tower 119.1, JetBlue 345, good day"
  },

  /* ---------------- ARRIVAL ---------------- */
  {
    id: 31,
    type: 'arrival',
    atc_call: "Delta 789, cleared to land runway 27, wind 260 at 7",
    expected_keywords: ['cleared', 'land', 'runway', '27', 'wind', '260', 'delta', '789'],
    perfect_response: "Cleared to land runway 27, Delta 789"
  },
  {
    id: 32,
    type: 'arrival',
    atc_call: "United 456, runway 9 Left, cleared to land, traffic departing",
    expected_keywords: ['runway', '9', 'left', 'cleared', 'land', 'traffic', 'departing', 'united', '456'],
    perfect_response: "Runway 9 Left, cleared to land, traffic departing, United 456"
  },
  {
    id: 33,
    type: 'arrival',
    atc_call: "Spirit 892, number 2, follow Cessna on short final, cleared to land runway 15",
    expected_keywords: ['number', '2', 'follow', 'cessna', 'short', 'final', 'cleared', 'land', 'runway', '15', 'spirit', '892'],
    perfect_response: "Number 2, following Cessna, cleared to land runway 15, Spirit 892"
  },
  {
    id: 34,
    type: 'arrival',
    atc_call: "November 1234, runway 4 Right, cleared to land, wind 040 at 5",
    expected_keywords: ['runway', '4', 'right', 'cleared', 'land', 'wind', '040', 'november', '1234'],
    perfect_response: "Runway 4 Right, cleared to land, wind 040 at 5, November 1234"
  },
  {
    id: 35,
    type: 'arrival',
    atc_call: "JetBlue 345, cleared to land runway 18, caution wake turbulence, heavy 757 departing",
    expected_keywords: ['cleared', 'land', 'runway', '18', 'caution', 'wake', 'turbulence', 'heavy', '757', 'jetblue', '345'],
    perfect_response: "Cleared to land runway 18, caution wake turbulence, JetBlue 345"
  },

  /* ---------------- TAXI IN ---------------- */
  {
    id: 36,
    type: 'taxi_in',
    atc_call: "Delta 789, taxi to parking via Alpha, monitor ground 121.9",
    expected_keywords: ['taxi', 'parking', 'alpha', 'monitor', 'ground', '121.9', 'delta', '789'],
    perfect_response: "Taxi to parking via Alpha, monitoring ground 121.9, Delta 789"
  },
  {
    id: 37,
    type: 'taxi_in',
    atc_call: "United 456, taxi to gate B12 via Bravo Delta",
    expected_keywords: ['taxi', 'gate', 'b12', 'bravo', 'delta', 'united', '456'],
    perfect_response: "Taxi to gate B12 via Bravo Delta, United 456"
  },
  {
    id: 38,
    type: 'taxi_in',
    atc_call: "Spirit 892, cross runway 10, then taxi to ramp via Echo",
    expected_keywords: ['cross', 'runway', '10', 'taxi', 'ramp', 'echo', 'spirit', '892'],
    perfect_response: "Cross runway 10, taxi to ramp via Echo, Spirit 892"
  },
  {
    id: 39,
    type: 'taxi_in',
    atc_call: "November 1234, taxi to hangar via Foxtrot, hold short runway 15",
    expected_keywords: ['taxi', 'hangar', 'foxtrot', 'hold', 'short', 'runway', '15', 'november', '1234'],
    perfect_response: "Taxi to hangar via Foxtrot, hold short runway 15, November 1234"
  },
  {
    id: 40,
    type: 'taxi_in',
    atc_call: "JetBlue 345, taxi to gate C3 via Golf Hotel, monitor ground",
    expected_keywords: ['taxi', 'gate', 'c3', 'golf', 'hotel', 'monitor', 'ground', 'jetblue', '345'],
    perfect_response: "Taxi to gate C3 via Golf Hotel, monitoring ground, JetBlue 345"
  },

  /* ---------------- IFR CLEARANCE ---------------- */
  {
    id: 41,
    type: 'ifr_clearance',
    atc_call: "Delta 789, cleared to Atlanta Hartsfield Airport as filed, climb via SID, maintain 5000, departure frequency 120.4, squawk 2345",
    expected_keywords: ['cleared', 'atlanta', 'hartsfield', 'airport', 'as', 'filed', 'climb', 'sid', 'maintain', '5000', 'departure', 'frequency', '120.4', 'squawk', '2345', 'delta', '789'],
    perfect_response: "Cleared to Atlanta Hartsfield Airport as filed, climb via SID, maintain 5000, departure 120.4, squawk 2345, Delta 789"
  },
  {
    id: 42,
    type: 'ifr_clearance',
    atc_call: "United 456, cleared to Chicago O'Hare as filed, maintain 4000, expect flight level 330 ten minutes after, departure 125.7, squawk 3456",
    expected_keywords: ['cleared', 'chicago', 'ohare', 'as', 'filed', 'maintain', '4000', 'expect', 'flight', 'level', '330', 'departure', '125.7', 'squawk', '3456', 'united', '456'],
    perfect_response: "Cleared to Chicago O'Hare as filed, maintain 4000, expect flight level 330 in ten, departure 125.7, squawk 3456, United 456"
  },
  {
    id: 43,
    type: 'ifr_clearance',
    atc_call: "Spirit 892, cleared to Orlando International as filed, climb and maintain 6000, departure 119.2, squawk 4567",
    expected_keywords: ['cleared', 'orlando', 'international', 'as', 'filed', 'climb', 'maintain', '6000', 'departure', '119.2', 'squawk', '4567', 'spirit', '892'],
    perfect_response: "Cleared to Orlando International as filed, climb and maintain 6000, departure 119.2, squawk 4567, Spirit 892"
  },
  {
    id: 44,
    type: 'ifr_clearance',
    atc_call: "November 1234, cleared to Dallas Love Field as filed, maintain 3000, expect 8000 ten minutes after, departure 127.0, squawk 5678",
    expected_keywords: ['cleared', 'dallas', 'love', 'field', 'as', 'filed', 'maintain', '3000', 'expect', '8000', 'departure', '127.0', 'squawk', '5678', 'november', '1234'],
    perfect_response: "Cleared to Dallas Love Field as filed, maintain 3000, expect 8000 in ten, departure 127.0, squawk 5678, November 1234"
  },
  {
    id: 45,
    type: 'ifr_clearance',
    atc_call: "JetBlue 345, cleared to Miami International via the WINCO2 departure, maintain 2000, expect 10000 after five minutes, departure 119.7, squawk 6789",
    expected_keywords: ['cleared', 'miami', 'international', 'via', 'winco2', 'departure', 'maintain', '2000', 'expect', '10000', 'after', 'five', 'departure', '119.7', 'squawk', '6789', 'jetblue', '345'],
    perfect_response: "Cleared to Miami International via the WINCO2 departure, maintain 2000, expect 10000 after five, departure 119.7, squawk 6789, JetBlue 345"
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