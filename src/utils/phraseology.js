export const digitsToICAOMap = {
  '0': 'zero',
  '1': 'wun',
  '2': 'too',
  '3': 'tree',
  '4': 'fower',
  '5': 'fife',
  '6': 'six',
  '7': 'seven',
  '8': 'ait',
  '9': 'niner'
};

// Convert numbers within a string to ICAO phonetics (simple digit-by-digit replacement)
export const convertToICAO = (text = '') => {
  if (!text) return text;
  return text
    .replace(/\b(\d)\b/g, (_, d) => digitsToICAOMap[d] || d) // isolated single digits
    .replace(/(\d)/g, (m) => digitsToICAOMap[m] || m)         // any remaining digits
    .replace(/point/gi, 'decimal');
};

export const transformScenarioPhraseology = (scenario, phraseology = 'FAA') => {
  if (phraseology === 'FAA') return scenario;
  // Shallow clone
  const converted = {
    ...scenario,
    atc_call: convertToICAO(scenario.atc_call),
    perfect_response: convertToICAO(scenario.perfect_response),
    expected_keywords: scenario.expected_keywords?.map(k => convertToICAO(k)) || []
  };
  return converted;
}; 