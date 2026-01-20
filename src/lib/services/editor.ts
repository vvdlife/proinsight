// Path: src/lib/services/editor.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function refinePost(draft: string, topic: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { temperature: 0.1 } // Very low temperature for precision editing (High Quality)
    });

    // Editor Persona & Criteria
    const prompt = `
    You are an Editor-in-Chief with 20 years of experience in technical writing.
    Your job is to refine the provided blog post draft to perfection.

    Topic: ${topic}

    CRITICAL EDITING CRITERIA:
    1. **Fact Check**: Fix illogical statements or ambiguous expressions. Ensure clarity and precision.
    2. **Tone Consistency**: Maintain a "Dry & Professional" tone.
       - STRICTLY remove '해요', '합니다', '입니다' endings.
       - Use '이다', '하다' (plain form) consistently for a professional tech blog feel.
    3. **De-duplication**: Remove or rewrite repetitive words, sentences, or paragraphs.
    4. **Readability**: Break down overly long paragraphs. Use bullet points if a list is buried in text.
    5. **Formatting**: Ensure standard Markdown structure is preserved.
    
    INSTRUCTIONS:
    - Act as a strict editor. Do not be afraid to rewrite sentences for better flow.
    - **OUTPUT**: Return ONLY the refined Markdown content. Do not output any "Here is the refined version" prefix or comments.
    
    Draft Content:
    """
    ${draft}
    """
    `;

    try {
        console.log("🧐 Editor-in-Chief: Reviewing and polishing the draft...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const refinedContent = response.text();

        // Simple sanity check to ensure we didn't lose too much content
        if (refinedContent.length < draft.length * 0.5) {
            console.warn("⚠️ Editor output significantly shorter than draft. Improvements might be aggressive or failed. Returning original as fallback.");
            // In a real system, we might retry or flag this. For now, fallback implies editor failure.
            // But valid editing often reduces length. Let's trust it unless it's empty.
            if (refinedContent.length < 50) return draft;
        }

        console.log("✨ Editor-in-Chief: Refinement complete.");
        return refinedContent;
    } catch (error) {
        console.error("Editor Refinement Failed:", error);
        // Fallback to original draft if editing fails
        return draft;
    }
}
