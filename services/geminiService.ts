
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getGeminiModel = (modelName: 'gemini-2.5-flash' | 'gemini-2.5-flash-preview-tts') => {
    // This is a simple factory, but in a real app might handle more logic.
    return ai.models;
};

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string, prompt: string) => {
    const models = getGeminiModel('gemini-2.5-flash');
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: base64Image,
        },
    };
    const textPart = {
        text: prompt,
    };

    const response = await models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};

export const generateStoryFromImage = async (base64Image: string, mimeType: string) => {
    const models = getGeminiModel('gemini-2.5-flash');
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: base64Image,
        },
    };
    const textPart = {
        text: "Analyze the mood and scene of this image. Then, write an evocative opening paragraph to a story set in this world. The tone should be creative and engaging.",
    };

    const response = await models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
    const models = getGeminiModel('gemini-2.5-flash-preview-tts');
    const response = await models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with an expressive, narrative voice: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
};
