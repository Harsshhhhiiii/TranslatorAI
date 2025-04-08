import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest"
});

export const detectAndTranslate = async (imageBuffer, mimeType) => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
            }
        };

        const prompt = `Analyze this image and:
            1. Detect any text present in any language
            2. If text is in English, translate to Hindi
            3. If text is in Hindi, translate to English
            4. If text is in another language, translate to both English and Hindi
            5. Return only the translated texts and no additional information not even Translation written explicitly, just give the translated text."
            6. If no text found, return "No text detected in image"`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        
        if (!response.text().trim()) {
            throw new Error('No response from Gemini API');
        }
        
        return response.text();
    } catch (error) {
        console.error('Gemini Error:', error);
        throw new Error(`Translation failed: ${error.message}`);
    }
};