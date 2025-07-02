// src/services/openaiService.js
// Service for generating ATC scenarios using OpenAI's Chat Completion API.
// Falls back to a locally defined scenario if no API key is configured or a request fails.

import { getRandomScenario } from '../data/scenarios';

// Utility to safely parse JSON coming from the model
const safeJSONParse = (text) => {
  try {
    // Attempt to clean up common formatting issues like triple backticks
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ Failed to parse scenario JSON from OpenAI after cleanup:', err, text);
    return null;
  }
};

// Build the system/user prompt used for scenario generation
const buildPrompt = (type, callsign, phraseology = 'FAA') => {
  // Map type to human-readable label for better prompt clarity
  const typeLabels = {
    ifr_clearance: 'IFR Clearance',
    pushback: 'Pushback & Engine Start',
    taxi_out: 'Taxi (Departure)',
    takeoff: 'Takeoff',
    departure: 'Departure',
    center: 'Center',
    approach: 'Approach',
    arrival: 'Arrival',
    taxi_in: 'Taxi (Arrival)',
    all: 'Random'
  };

  const label = typeLabels[type] || 'Random';

  const allowedTypesStr = Object.keys(typeLabels).filter(t => t !== 'all').map(t => `'${t}'`).join(',');

  return `You are an AI assistant that generates realistic air-traffic-control (ATC) radio calls for pilot read-back training using the specific aircraft callsign "${callsign}". Use ${phraseology.toUpperCase()} phraseology/terminology.

` +
         `Generate ONE random ${label} scenario and return ONLY a JSON object with the following keys:
` +
         `id (number),
` +
         `type (one of ${allowedTypesStr}),
` +
         `atc_call (string),
` +
         `expected_keywords (array of lowercase keywords required in the pilot read-back),
` +
         `perfect_response (string).

` +
         `The expected_keywords array should contain 5-10 short lowercase words/phrases that must appear in a correct read-back (including words from the callsign) and will be used for automatic scoring.
` +
         `Ensure the JSON is valid and does NOT contain any extra keys or human commentary.`;
};

// Helper to inject callsign into a fallback/local scenario if needed
const mergeCallsignIntoScenario = (scenario, callsign) => {
  if (!callsign) return scenario;
  // Create shallow copy to avoid mutating shared static data
  scenario = { ...scenario, expected_keywords: [...(scenario.expected_keywords || [])] };
  const csWords = callsign.toLowerCase().split(/\s+/).filter(Boolean);

  // Replace initial callsign (before first comma) if pattern fits
  if (scenario.atc_call.includes(',')) {
    const parts = scenario.atc_call.split(',');
    parts[0] = callsign;
    scenario.atc_call = parts.join(',');
  } else {
    scenario.atc_call = `${callsign}, ${scenario.atc_call}`;
  }

  // Ensure expected keywords contain callsign components
  scenario.expected_keywords = Array.from(new Set([...(scenario.expected_keywords || []), ...csWords]));

  if (scenario.perfect_response) {
    if (scenario.perfect_response.includes(',')) {
      const prParts = scenario.perfect_response.split(',');
      prParts[prParts.length - 1] = ` ${callsign}`; // append at end ensure callsign present
      scenario.perfect_response = prParts.join(',');
    } else {
      scenario.perfect_response = `${scenario.perfect_response}, ${callsign}`;
    }
  }
  return scenario;
};

export const generateAIScenario = async (type = 'all', callsign = '', phraseology = 'FAA') => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // If no API key, immediately fall back to local scenarios
  if (!apiKey) {
    console.warn('⚠️  VITE_OPENAI_API_KEY not set – falling back to local scenarios');
    return mergeCallsignIntoScenario(getRandomScenario(type), callsign);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'You are ChatGPT.'
          },
          {
            role: 'user',
            content: buildPrompt(type, callsign, phraseology)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const scenario = safeJSONParse(content);

    if (!scenario || !scenario.atc_call || !scenario.expected_keywords) {
      throw new Error('Incomplete scenario data from OpenAI');
    }

    // Ensure id exists – if not, generate timestamp id
    if (typeof scenario.id === 'undefined' || scenario.id === null) {
      scenario.id = Date.now();
    }

    return mergeCallsignIntoScenario(scenario, callsign);
  } catch (err) {
    console.error('❌ Error generating scenario with OpenAI:', err);
    // Fallback to local scenario on error
    return mergeCallsignIntoScenario(getRandomScenario(type), callsign);
  }
}; 