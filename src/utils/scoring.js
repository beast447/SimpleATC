// Normalize text for comparison - remove punctuation, convert to lowercase
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
};

// Check if a keyword exists in the transcript with some flexibility
const keywordExists = (keyword, transcript) => {
  const normalizedKeyword = normalizeText(keyword);
  const normalizedTranscript = normalizeText(transcript);
  
  // Direct match
  if (normalizedTranscript.includes(normalizedKeyword)) {
    return true;
  }
  
  // Handle common aviation phonetics and variations
  const aviationMappings = {
    'niner': '9',
    'nine': '9',
    'fiver': '5',
    'five': '5',
    'tree': '3',
    'three': '3',
    'alpha': 'a',
    'bravo': 'b',
    'charlie': 'c',
    'delta': 'd',
    'echo': 'e',
    'foxtrot': 'f',
    'golf': 'g',
    'hotel': 'h',
    'india': 'i',
    'juliet': 'j',
    'kilo': 'k',
    'lima': 'l',
    'mike': 'm',
    'november': 'n',
    'oscar': 'o',
    'papa': 'p',
    'quebec': 'q',
    'romeo': 'r',
    'sierra': 's',
    'tango': 't',
    'uniform': 'u',
    'victor': 'v',
    'whiskey': 'w',
    'xray': 'x',
    'yankee': 'y',
    'zulu': 'z'
  };
  
  // Check if keyword appears with aviation phonetic variations
  for (const [phonetic, letter] of Object.entries(aviationMappings)) {
    if (normalizedKeyword === phonetic && normalizedTranscript.includes(letter)) {
      return true;
    }
    if (normalizedKeyword === letter && normalizedTranscript.includes(phonetic)) {
      return true;
    }
  }
  
  return false;
};

// Main scoring function
export const scoreResponse = (expectedKeywords, actualTranscript) => {
  if (!actualTranscript || actualTranscript.trim() === '') {
    return {
      score: 0,
      matches: 0,
      total: expectedKeywords.length,
      missing: expectedKeywords,
      present: [],
      feedback: 'No response detected'
    };
  }
  
  const present = [];
  const missing = [];
  
  expectedKeywords.forEach(keyword => {
    if (keywordExists(keyword, actualTranscript)) {
      present.push(keyword);
    } else {
      missing.push(keyword);
    }
  });
  
  const score = Math.round((present.length / expectedKeywords.length) * 100);
  
  let feedback = '';
  if (score >= 90) {
    feedback = 'Excellent! Perfect phraseology.';
  } else if (score >= 75) {
    feedback = 'Good response! Minor elements missing.';
  } else if (score >= 50) {
    feedback = 'Decent attempt, but several key elements missing.';
  } else {
    feedback = 'Needs improvement. Focus on including all required elements.';
  }
  
  return {
    score,
    matches: present.length,
    total: expectedKeywords.length,
    missing,
    present,
    feedback
  };
};

// Get score category for styling
export const getScoreCategory = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'needs-work';
};

// Generate specific feedback based on missing elements
export const generateDetailedFeedback = (missing, present, scenarioType) => {
  const feedback = [];
  
  // Check for missing callsign
  const hasCallsign = present.some(item => 
    /^[a-z]+\s*\d+$/i.test(item) || 
    ['november', 'delta', 'american', 'united', 'southwest', 'spirit', 'jetblue'].includes(item.toLowerCase())
  );
  
  if (!hasCallsign) {
    feedback.push('Remember to include your full callsign in the readback');
  }
  
  // Check for missing key action words
  const actionWords = ['cleared', 'taxi', 'contact', 'turn', 'descend', 'maintain'];
  const missingActions = missing.filter(item => actionWords.includes(item.toLowerCase()));
  
  if (missingActions.length > 0) {
    feedback.push(`Missing key action words: ${missingActions.join(', ')}`);
  }
  
  // Check for missing runway information
  const runwayInfo = missing.filter(item => 
    item.toLowerCase().includes('runway') || 
    item.toLowerCase().includes('left') || 
    item.toLowerCase().includes('right') ||
    /^\d+[lr]?$/i.test(item)
  );
  
  if (runwayInfo.length > 0) {
    feedback.push('Include complete runway information (number and side)');
  }
  
  if (feedback.length === 0 && missing.length > 0) {
    feedback.push(`Missing elements: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''}`);
  }
  
  return feedback;
}; 