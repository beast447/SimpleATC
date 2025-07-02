// Basic ICAO adjustments without phonetically spelling digits.
export const convertToICAO = (text = '') => {
  if (!text) return text;
  return text.replace(/\bpoint\b/gi, 'decimal');
};

// Simple word substitutions to give scenarios a more European flavour
const wordSwaps = [
  // Airlines
  { us: /\bDelta\b/gi, eu: 'Lufthansa' },
  { us: /\bUnited\b/gi, eu: 'British Airways' },
  { us: /\bSpirit\b/gi, eu: 'Ryanair' },
  { us: /\bJetBlue\b/gi, eu: 'EasyJet' },
  // Airports & waypoints
  { us: /Atlanta Hartsfield/gi, eu: 'London Heathrow' },
  { us: /Chicago O'?Hare/gi, eu: 'Paris Charles de Gaulle' },
  { us: /Orlando International/gi, eu: 'Amsterdam Schiphol' },
  { us: /Dallas Love Field/gi, eu: 'Berlin Brandenburg' },
  { us: /Miami International/gi, eu: 'Madrid Barajas' },
  // Misc radios
  { us: /Houston Center/gi, eu: 'Brussels Control' }
];

const applyEuropeanFlavor = (text = '') => {
  let result = text;
  wordSwaps.forEach(({ us, eu }) => {
    result = result.replace(us, eu);
  });
  return result;
};

export const transformScenarioPhraseology = (scenario, phraseology = 'FAA') => {
  if (phraseology === 'FAA') return scenario;
  // Shallow clone
  const converted = {
    ...scenario,
    atc_call: applyEuropeanFlavor(convertToICAO(scenario.atc_call)),
    perfect_response: applyEuropeanFlavor(convertToICAO(scenario.perfect_response)),
    expected_keywords: scenario.expected_keywords?.map(k => applyEuropeanFlavor(convertToICAO(k))) || []
  };
  return converted;
}; 