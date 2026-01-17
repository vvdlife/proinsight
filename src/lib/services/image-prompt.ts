import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateImagePrompt(topic: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
You are a creative director for a tech blog.
Task: Create a perfect English image prompt for a blog thumbnail based on the topic: "${topic}".
Style requirements: Photorealistic, Cinematic lighting, High Quality, Abstract tech element.
Constraint: Return ONLY the prompt text. Do not add any conversational filler.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Image Prompt Generation Error:", error);
        // Fallback prompt
        return `High tech abstract background representing ${topic}, cinematic lighting, photorealistic, 8k`;
    }
}
