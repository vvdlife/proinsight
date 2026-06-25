import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateImagePrompt(
    topic: string, 
    apiKey: string, 
    customPrompt?: string,
    contentSummary?: string
): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image" });

    let prompt = `
You are an expert creative director and professional digital illustrator.
Your task is to create a detailed, highly descriptive English image prompt for a blog cover image.

[Blog Post Information]
- Topic: "${topic}"
${contentSummary ? `- Content Summary: "${contentSummary}"` : ""}

[Instructions for Prompt Design]
1. Analyze the core concept, mood, and subject of the blog post.
2. Design a single, cohesive visual scene that serves as a professional, direct illustration of the topic. Ensure every element in the image supports the core theme and looks highly realistic or professional.
3. Keep the visual themes strictly aligned with the blog's core target domains: **Finance, Economics, and Technology**.
   - Technology: Focus on abstract digital networks, cybersecurity concepts, futuristic data hubs, clean software wireframes, AI representations, or microelectronics.
   - Finance & Economics: Focus on high-tech financial charts, candlestick stock graphs, abstract global market trends, digital economic dashboards, Wall Street skyscrapers, or modern office analysis setups.
   - Style & Tone: Prioritize clean, premium, and professional business-grade aesthetics (e.g., modern 3D render, high-end isometric illustration, minimalist vector design, or cinematic tech-illustration) suitable for a professional analytics blog (resembling illustrations from Bloomberg, Harvard Business Review, or The Economist).
4. STRICT VISUAL CONSTRAINT (Prevent Weird Metaphors):
   - Do NOT generate abstract fantasy elements such as mysterious gates, arches, portal gates, winding brick roads in nature, or scenic mountain paths unless it's a direct nature blog.
   - All visual elements must be grounded in modern business, urban finance, or high-tech environments.
5. Describe:
   - The central subject or objects (shape, material, arrangement)
   - The background and environment (e.g., modern trading floor, office, futuristic server room, minimalist grid)
   - The color palette and lighting style (e.g., corporate blues, vibrant gradients, warm/cool accents, dark-mode)
   - The artistic style (aligned with the premium professional themes)
6. NEGATIVE CONSTRAINTS (Crucial):
   - Absolutely NO text, letters, logos, numbers, or dates.
   - No bovine/ox/buffalo/bull/bear shapes (even when illustrating financial market trends).
   - No fantasy pathways, arches, or gates.
    `;

    if (customPrompt) {
        prompt += `\n\n[User Custom Styling Instruction]\nApply the following style/direction to the design: "${customPrompt}". This instruction takes priority over other stylistic suggestions.`;
    }

    prompt += `\n\nReturn ONLY the generated image prompt text. Do not include introductory or concluding remarks.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Image Prompt Generation Error:", error);
        // Fallback prompt
        return `${topic} background, cinematic lighting, high quality, professional illustration`;
    }
}
