import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateImagePrompt(topic: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image" });

    const prompt = `
You are a creative director for a tech blog.
        Task: Create a perfect English image prompt for a blog thumbnail based on the topic: "${topic}".
    Style requirements: Photorealistic, Cinematic lighting, High Quality, Abstract tech element.
    NEGATIVE CONSTRAINT: 
    1. Ensure the image does NOT contain any bull, ox, buffalo, or similar animal shapes. Focus on abstract or human / tech representations.
    2. Absolutely do NOT include any text, letters, numbers, years (such as 2024, 2025, 2026), dates, or readable typography in the image. The image must be purely visual.
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
