
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const explainCode = async (code: string, language: string) => {
  const ai = getAI();
  const prompt = `Explain the following ${language} code snippet in detail, focusing on its purpose, logic, and any potential optimizations. 
  Code:
  \`\`\`${language}
  ${code}
  \`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A detailed markdown explanation of the code snippet.",
            },
            complexity: {
              type: Type.STRING,
              description: "The estimated time complexity (e.g., O(n)).",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of potential improvements or best practices.",
            },
          },
          required: ["explanation"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Explanation failed:", error);
    throw error;
  }
};

export const detectLanguage = async (code: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Analyze the following code and identify its programming language. 
  Supported values: javascript, typescript, python, rust, html, css, dockerfile, bash.
  Return only the language name.
  
  Code:
  ${code.substring(0, 1000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: {
              type: Type.STRING,
              description: "The identified programming language slug.",
            },
          },
          required: ["language"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result.language.toLowerCase();
  } catch (error) {
    console.error("Language detection failed:", error);
    return "javascript"; // Fallback
  }
};
