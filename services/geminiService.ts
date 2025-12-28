
import { GoogleGenAI, Type } from "@google/genai";
import { Vehicle, AIResponse } from "../types";

/**
 * Utility to clean potential markdown from AI JSON responses
 */
const cleanJSON = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const analyzeLogistics = async (vehicles: Vehicle[]): Promise<AIResponse> => {
  // Always use process.env.API_KEY as the single source of truth
  const apiKey = process.env.API_KEY;

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `System Role: You are the Lead AI Controller for KHI SECURE. 
      Analyze this real-time Karachi fleet data: ${JSON.stringify(vehicles)}. 
      
      Karachi Context: 
      - Port Qasim to SITE route often has heavy traffic.
      - Sharea Faisal is a high-speed but congested artery.
      - Night-time security near bypass areas is critical.
      
      Task: Evaluate security risks, battery levels, and route efficiency.
      Output exactly in JSON format:
      {
        "summary": "Brief professional overview of fleet health (2 sentences)",
        "recommendations": ["4 specific tactical steps for operators"],
        "riskLevel": "Low" | "Medium" | "High"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
          },
          required: ["summary", "recommendations", "riskLevel"]
        }
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("Empty AI Response");

    return JSON.parse(cleanJSON(rawText));
  } catch (error) {
    console.error("Gemini Logistics Analysis Failure:", error);
    return {
      summary: "AI Engine encountered a synchronization error. Operating on standard protocols.",
      recommendations: [
        "Monitor battery levels manually for sim_2",
        "Maintain direct radio contact with all units",
        "Verify network link in command dashboard",
        "Check API Key permissions in Google Console"
      ],
      riskLevel: "Medium"
    };
  }
};
