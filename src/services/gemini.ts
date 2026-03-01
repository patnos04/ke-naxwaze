import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    level: { type: Type.NUMBER },
    question: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    answer: { type: Type.STRING },
    difficulty: { type: Type.STRING }
  },
  required: ["level", "question", "options", "answer", "difficulty"]
};

export async function generateQuestion(level: number, language: string, usedTexts: string[] = []): Promise<Question> {
  const difficulty = level <= 4 ? "easy" : level <= 8 ? "medium" : "hard";
  
  const langNames = {
    ku: "Kurmancî (Kurdish)",
    tr: "Türkçe (Turkish)",
    en: "English"
  };

  const avoidPrompt = usedTexts.length > 0 
    ? `\n\nVAN PIRSAN NEPIRSIN (berê hatine pirsîn):\n${usedTexts.map(t => `- ${t}`).join('\n')}`
    : "";

  const prompt = `Hûn motora lîstika "Kê Naxwaze Bi Serkeve" (Mîlyoner) ne. 
Erka we ev e ku hûn pirsiyarek bi zimanê ${langNames[language as keyof typeof langNames]} amade bikin.

GIRÎNG: Mijara pirsê divê her tim li ser çand, dîrok, erdnîgarî, wêje, huner an jî kesayetên Kurd be. Pirs divê bi "mantiqê Kurdî" û bi motîfên Kurdewarî were amadekirin, her çend zimanê pirsê ${langNames[language as keyof typeof langNames]} be jî.

Asta pirsê: ${level} (ji 13'an)
Zehmetî: ${difficulty}${avoidPrompt}

Rêzikên pirsê:
1. Pirs divê orîjînal be û her tim li ser mijarên Kurdewarî be.
2. Mijar: Dîroka Kurdistanê, wêjeya Kurdî, erdnîgariya Kurdistanê, hunermendên Kurd, hwd.
3. Vebijark (options) divê nêzî hev bin leh tenê yek bersiva rast a zelal hebe.
4. Zimanê ${langNames[language as keyof typeof langNames]} divê bêkêmasî be (rêziman û peyvên rast).

Tenê û tenê bi formata JSON bersivê bidin. Tu metnên din lê zêde nekin.

JSON Schema:
{ 
  "level": ${level}, 
  "question": "metna pirsê", 
  "options": ["vebijark 1", "vebijark 2", "vebijark 3", "vebijark 4"], 
  "answer": "bersiva rast (divê tam wekî yek ji vebijarkan be)", 
  "difficulty": "${difficulty}" 
}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionSchema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as Question;
}

export async function translateQuestion(question: Question, targetLanguage: string): Promise<Question> {
  const langNames = {
    ku: "Kurmancî (Kurdish)",
    tr: "Türkçe (Turkish)",
    en: "English"
  };

  const prompt = `Translate the following quiz question into ${langNames[targetLanguage as keyof typeof langNames]}. 
Maintain the exact same meaning, structure, and Kurdish cultural context. Ensure the options and the answer match perfectly in the target language while preserving the "Kurdish logic" of the original.

Question Object:
${JSON.stringify(question, null, 2)}

Respond ONLY with the translated JSON object following the same schema.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionSchema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as Question;
}
