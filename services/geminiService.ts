
import { GoogleGenAI, Type } from "@google/genai";
import { Vehicle, AIResponse } from "../types";

// Always use the API_KEY from process.env directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLogistics = async (vehicles: Vehicle[]): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this real-time Karachi logistics fleet data: ${JSON.stringify(vehicles)}. 
      Context: Karachi has complex traffic (Saddar, Sharea Faisal), potential security zones, and varying road quality.
      Provide a summary, risk level, and specific optimization recommendations.`,
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

    // Access .text property directly and trim as per guidelines
    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("No text response received from AI");
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "Real-time AI analysis currently offline. Manual monitoring recommended.",
      recommendations: ["Ensure all vehicles stick to designated safe routes", "Verify driver IDs manually"],
      riskLevel: "Medium"
    };
  }
};
