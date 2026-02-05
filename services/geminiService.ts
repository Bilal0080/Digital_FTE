
import { GoogleGenAI, Type } from "@google/genai";
import { CEOReport } from "../types";

// Business data analysis and briefing generation using Gemini
export const generateCEOBriefing = async (transactions: any[], tasks: any[]): Promise<CEOReport | null> => {
  // Always use process.env.API_KEY directly and initialize right before call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as a Senior Business Analyst. Analyze the following business data for the week:
    Transactions: ${JSON.stringify(transactions)}
    Tasks: ${JSON.stringify(tasks)}
    
    Generate a concise CEO Briefing including total revenue, MTD progress, bottlenecks, and costs-saving suggestions.
    Be proactive and data-driven.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            revenue: { type: Type.NUMBER },
            mtdRevenue: { type: Type.NUMBER },
            completedTasks: { type: Type.INTEGER },
            bottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["revenue", "mtdRevenue", "completedTasks", "bottlenecks", "suggestions"]
        }
      }
    });

    // Access .text property directly as per SDK guidelines
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini Briefing Generation failed:", error);
    return null;
  }
};

// General AI reasoning for file analysis and business logic
export const getAIReasoning = async (context: string, query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${context}\n\nTask: ${query}\n\nProvide reasoning as a 'Digital FTE' employee.`,
    });
    return response.text || "No reasoning available.";
  } catch (error) {
    console.error("Reasoning failed:", error);
    return "Failed to connect to reasoning engine.";
  }
};
