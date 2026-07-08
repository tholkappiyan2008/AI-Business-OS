import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not defined in the environment variables.');
}

// Initialize the Gemini client using the new @google/genai SDK
// Explicitly pass the API key to avoid default credential errors
// If missing, pass a dummy string so it doesn't fallback to Vertex AI/ADC
export const geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY'
});
