
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are 'Goldie', a warm, empathetic, and patient companion for seniors. Use gentle language, ask about memories, and provide emotional support. Keep responses concise and easy to read.",
    }
  });
  
  // Note: Standard Chat API uses sendMessage
  const result = await chat.sendMessage({ message: prompt });
  return result.text;
};

export const generateReminiscenceImage = async (memoryDescription: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A warm, nostalgic, painterly oil painting style depiction of: ${memoryDescription}. Cinematic lighting, comforting atmosphere, focused on emotional resonance.` }
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
    contents: `Analyze the mood of this text from a senior user. Rate Joy and Engagement from 1-10. Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          joy: { type: Type.NUMBER },
          engagement: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        },
        required: ["joy", "engagement"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { joy: 5, engagement: 5 };
  }
};
