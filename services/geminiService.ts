import { GoogleGenAI, Type } from "@google/genai";
import { SubTask } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSubtasks = async (taskTitle: string): Promise<Omit<SubTask, 'id' | 'isCompleted'>[]> => {
    // No try/catch here, let the UI handle the error to show a toast/alert
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Break down the task "${taskTitle}" into 3 to 5 clear, actionable, short sub-steps. Language: Russian.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "The title of the subtask step (in Russian)."
                        }
                    },
                    required: ["title"]
                }
            }
        }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    return data as { title: string }[];
};