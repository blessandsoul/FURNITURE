import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let genaiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!genaiInstance) {
    genaiInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    logger.info(`Gemini client initialized with model: ${env.GEMINI_MODEL}`);
  }
  return genaiInstance;
}
