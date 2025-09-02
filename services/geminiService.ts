
import { GoogleGenAI, Type } from "@google/genai";

export const suggestSubtasks = async (taskTitle: string, apiKey: string): Promise<string[]> => {
  if (!apiKey) {
    throw new Error("API Key is not set. Please configure it in the settings.");
  }
  const ai = new GoogleGenAI({ apiKey });
    
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down the task "${taskTitle}" into a list of smaller, actionable sub-tasks. The user is a busy professional balancing work and home life.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'A single, actionable sub-task.'
              }
            }
          }
        },
      },
    });

    if (response.text) {
      const jsonResponse = JSON.parse(response.text);
      return jsonResponse.subtasks || [];
    }
    return [];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided API Key is invalid. Please check it in the settings.");
    }
    throw new Error("Failed to get AI suggestions. Please try again later.");
  }
};
