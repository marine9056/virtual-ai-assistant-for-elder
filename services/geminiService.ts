
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserProfile } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (prompt: string, userProfile?: UserProfile) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemContext = userProfile ? `
    You are 'Goldie', a warm, empathetic companion for a senior user named ${userProfile.name}.
    User's age: ${userProfile.age}.
    User's interests: ${userProfile.interests.join(', ')}.
    Personalization Context: Always refer to them gently. If they mention interests like ${userProfile.interests[0]}, be enthusiastic.
    Use simple, clear sentences. Never be clinical; be like a lifelong friend.
  ` : "You are 'Goldie', a warm, empathetic, and patient companion for seniors.";

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemContext,
    }
  });
  
  const result = await chat.sendMessage({ message: prompt });
  return result.text;
};

export const generateReminiscenceImage = async (memoryDescription: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A warm, nostalgic, high-quality painterly illustration of a cherished memory: ${memoryDescription}. Focus on emotional warmth, glowing light, and soft textures.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const analyzeMood = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following senior user's sentiment: "${text}". Output numerical ratings for Joy, Engagement, and Energy (1-10).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          joy: { type: Type.NUMBER },
          engagement: { type: Type.NUMBER },
          energy: { type: Type.NUMBER },
          summary: { type: Type.STRING }
        },
        required: ["joy", "engagement", "energy"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { joy: 5, engagement: 5, energy: 5 };
  }
};
