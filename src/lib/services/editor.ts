// Path: src/lib/services/editor.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function refinePost(draft: string, topic: string, apiKey: string, experience?: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    // User requested Gemini Pro (High Quality) for refining
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro", // High-end model for superior nuances
        generationConfig: { temperature: 0.2 }
    });

    // Editor Persona & Criteria
    const prompt = `
    You are an Editor-in-Chief with 20 years of experience in technical writing.
    Your job is to refine the provided blog post draft to perfection.

    Topic: ${topic}

    USER EXPERIENCE (E-E-A-T) INJECTION:
    """
    ${experience || "N/A"}
    """

    CRITICAL EDITING CRITERIA:
    1. **E-E-A-T Integration**:
       - If "USER EXPERIENCE" is provided, you MUST weave it naturally into the content.
       - Do not just paste it; rewrite a paragraph to include this anecdote as if it happened to the author.
       - Use phrases like "In my experience...", "When I first encountered this...", etc.
    2. **Fact Check**: Fix illogical statements or ambiguous expressions. Ensure clarity and precision.
    3. **Tone Consistency**: Maintain a "Dry & Professional" tone, BUT make it sound human.
       - STRICTLY remove '해요', '합니다', '입니다' endings.
       - Use '이다', '하다' (plain form) consistently.
       - Avoid robotic or repetitive transition words (e.g., "Moreover", "However" overuse).
    4. **De-duplication**: Remove or rewrite repetitive words, sentences, or paragraphs.
    5. **Readability**: Break down overly long paragraphs. Use bullet points if a list is buried in text.
    6. **Formatting**: Ensure standard Markdown structure is preserved.
    
    INSTRUCTIONS:
    - Act as a strict editor. Do not be afraid to rewrite sentences for better flow.
    - **OUTPUT**: Return ONLY the refined Markdown content. Do not output any "Here is the refined version" prefix or comments.
    
    Draft Content:
    """
    ${draft}
    """
    `;

    try {
        console.log("🧐 Editor-in-Chief: Reviewing and polishing (Gemini 1.5 Pro)...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const refinedContent = response.text();

        // Simple sanity check
        if (refinedContent.length < 50) return draft;

        console.log("✨ Editor-in-Chief: Refinement complete.");
        return refinedContent;
    } catch (error) {
        console.error("Editor Refinement Failed:", error);
        return draft; // Fallback
    }
}
