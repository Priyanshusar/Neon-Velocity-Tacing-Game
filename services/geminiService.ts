
import { GoogleGenAI } from "@google/genai";
import { PlayerStats } from "../types";

export const getAICommentary = async (event: string, stats: PlayerStats): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    You are a hype-man commentator for a high-stakes futuristic neon bike race.
    Current Speed: ${Math.round(stats.speed * 100)} km/h
    Distance Covered: ${Math.round(stats.distance)} meters
    Event: ${event}
    
    Provide a very short (max 10 words), high-energy commentary. 
    Use terms like "Sonic boom!", "Neon demon!", "Absolute velocity!", "Cutting through the grid!".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 30,
        temperature: 0.9,
      }
    });

    return response.text?.trim() || "Pushing the limits!";
  } catch (error) {
    return "Maximum overdrive!";
  }
};
