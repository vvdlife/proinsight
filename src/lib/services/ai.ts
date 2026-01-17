// Path: src/lib/services/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PostFormValues } from "@/lib/schemas/post-schema";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// Output structure for Phase 1: Engineer
interface OutlineSection {
    heading: string;
    key_points: string[];
}

interface Outline {
    title: string;
    sections: OutlineSection[];
}

// Phase 1: The Architect - Generates a logical outline
async function generateOutline(data: PostFormValues, searchContext?: string): Promise<Outline> {
    // User requested Gemini 3 Flash or Pro. Using "gemini-3-pro-preview" for maximum Quality.
    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    });

    const prompt = `
You are a Senior Content Architect.
Your goal is to plan a comprehensive, professional technical blog post.

Topic: ${data.topic}
Keywords: ${data.keywords || "N/A"}
Tone: ${data.tone}
Length: ${data.length}

search_context:
"""
${searchContext || "No search context provided."}
"""

INSTRUCTIONS:
1. Analyze the 'search_context' to identify key themes and logical flow.
2. Structure the post into 5-8 distinct sections.
3. **CRITICAL**: The first section MUST be named "Key Takeaways (3줄 요약)".
4. For each section, define the 'heading' and 2-4 'key_points' to cover.
5. **CRITICAL**: Do NOT include numbers in the 'heading' string. (e.g., Use "Introduction", NOT "1. Introduction").
6. Ensure the flow is logical: Key Takeaways -> Introduction -> Core Concepts / Background -> In-Depth Analysis -> Real-world Examples -> Conclusion.
7. LANGUAGE: The title, headings, and key points MUST be in KOREAN (한국어).
8. Output MUST be valid JSON with this structure:
{
  "title": "A compelling title for the post (Korean)",
  "sections": [
    { "heading": "Section Heading (Korean)", "key_points": ["Point 1", "Point 2"] }
  ]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON Extraction (Senior Pattern)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in response");
        }

        return JSON.parse(jsonMatch[0]) as Outline;
    } catch (error) {
        console.error("Outline Generation Failed:", error);
        throw new Error("목차 생성에 실패했습니다. (AI Response Error)");
    }
}

// Phase 2: The Writer - Writes a specific section
async function generateSection(
    data: PostFormValues,
    section: OutlineSection,
    searchContext: string | undefined
): Promise<string> {
    // Using gemini-3-pro-preview for high-quality writing
    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { temperature: 0.2 }
    });

    const prompt = `
You are a Senior Technical Analyst. Write ONE section of a blog post.

Overall Topic: ${data.topic}
Current Section: ${section.heading}
Key Points to Cover:
${section.key_points.map(p => `- ${p}`).join("\n")}

search_context:
"""
${searchContext || ""}
"""

STRICT INSTRUCTIONS:
1. Write ONLY the content for this section. Do NOT repeat the heading.
2. **formatting**:
   - Use standard Markdown headers (###, ####) for subsections.
   - Do NOT use H1 (#) or H2 (##) as the section title is added automatically.
   - Do NOT manually number the section title (e.g., avoid "1. Introduction").
3. **Features**:
   - **핵심 요약 (Summary)**: Start the section with a concise "핵심 요약" summary if the section is complex or lengthy.
   - **Callouts**: Use GitHub Alert syntax for important notes or tips.
     > [!NOTE] This is a note.
     > [!TIP] This is a pro tip.
     > [!WARNING] Be careful with this.
   - **Tables**: Use Markdown tables for ANY comparison or structured data.
   - **Diagrams**: Use \`mermaid\` code blocks for processes or flows.
     **IMPORTANT**: You MUST quote all node labels to support Korean text and symbols.
     **CRITICAL**: Use the \`A -- "Text" --> B\` syntax for edge labels. DO NOT use \`-->|Text|\`.
     Example:
     \`\`\`mermaid
     graph TD
       A["시작 (Start)"] -- "조건 (Condition)" --> B["결과 (Result)"]
     \`\`\`
4. Incorporate deep insights from the 'search_context'.
5. CITATIONS: Use inline citations [1], [2] referencing the context.
6. If information is missing, admit it or focus on general principles.
7. Tone: ${data.tone}
8. LANGUAGE: Write strictly in KOREAN (한국어). Do not use English unless it is a proper noun or technical term.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return `## ${section.heading}\n\n${response.text()}`;
}

// Phase 3: The Assembly - Orchestrates the pipeline
export async function generateBlogPost(data: PostFormValues, searchContext?: string): Promise<string> {
    console.log("🚀 [Phase 1] Architect: Designing Outline...");
    const outline = await generateOutline(data, searchContext);
    console.log(`📋 Outline Generated: ${outline.title} (${outline.sections.length} sections)`);

    console.log("✍️ [Phase 2] Writer: Writing sections with Bounded Concurrency (Limit: 2)...");

    // Bounded Parallelism (Batch Size: 2)
    // This provides a balance between speed and stability (Rate Limits)
    const sectionContents: string[] = new Array(outline.sections.length).fill("");
    const CONCURRENCY_LIMIT = 2;

    for (let i = 0; i < outline.sections.length; i += CONCURRENCY_LIMIT) {
        const batch = outline.sections.slice(i, i + CONCURRENCY_LIMIT);
        console.log(`   ⚡ Processing Batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1} (${batch.length} sections)...`);

        await Promise.all(batch.map(async (section, batchIndex) => {
            const globalIndex = i + batchIndex;
            console.log(`   ⏳ Writing Section ${globalIndex + 1}/${outline.sections.length}: ${section.heading}...`);
            try {
                const content = await generateSection(data, section, searchContext);
                sectionContents[globalIndex] = content;
                console.log(`   ✅ Section ${globalIndex + 1} Done.`);
            } catch (error) {
                console.error(`   ❌ Section ${globalIndex + 1} Failed:`, error);
                sectionContents[globalIndex] = `## ${section.heading}\n\n(Content generation failed for this section due to API error.)`;
            }
        }));
    }

    console.log("🧩 [Phase 3] Assembly: Compiling final document...");

    // Extract References from Context (Simple Regex or parsing if valid format)
    const referenceMatch = searchContext?.matchAll(/\[(\d+)\] Title: (.*?)\nURL: (.*?)\n/g);
    let referencesSection = "\n\n## References\n";

    if (referenceMatch) {
        for (const match of referenceMatch) {
            referencesSection += `[${match[1]}] ${match[2]}: ${match[3]}\n\n`;
        }
    } else {
        referencesSection += "No references detected from search context.\n";
    }

    // Assemble final markdown
    const finalContent = `
# ${outline.title}

${sectionContents.join("\n\n")}

${referencesSection}
`;

    return finalContent;
}

export async function generateBlogImage(prompt: string): Promise<string | null> {
    try {
        const imageModel = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        const result = await imageModel.generateContent(prompt);
        const response = await result.response;

        // Imagen usually returns inlineData (Base64) in the parts
        // Checking specifically for standard Gemini API image response structure
        // Note: SDK structure for images might vary, checking candidates or parts
        // Assuming standard safety and parts structure

        // For now, let's dump the response structure in logs if needed, but try standard access
        // API typically returns 1 candidate with inlineData if successful
        const images = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData);

        if (images && images.length > 0 && images[0].inlineData) {
            const image = images[0].inlineData;
            return `data:${image.mimeType};base64,${image.data}`;
        }

        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
}

export async function optimizeContent(content: string, suggestions: string[]): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
            generationConfig: { temperature: 0.2 }
        });

        const prompt = `
        You are a Professional Content Editor.
        Your task is to REWRITE the provided blog post content to improve its SEO based on specific suggestions, while STRICTLY preserving its structure and formatting.

        SEO Suggestions to Apply:
        ${suggestions.map(s => `- ${s}`).join("\n")}

        CRITICAL CONSTRAINTS (Failure to follow these will break the app):
        1. **Preserve Markdwon**: Do NOT change the markdown structure (headings, lists, bold, italic).
        2. **Preserve Special Syntax**:
           - user-defined components (if any)
           - Mermaid Diagrams (\`\`\`mermaid ... \`\`\`) MUST be kept EXACTLY as is.
           - Tables MUST be kept as is.
           - Callouts (> [!NOTE]) MUST be kept as is.
        3. **No Hallucination**: Do NOT add new facts or change the meaning of the content. Only improve the styling, clarity, and keyword usage.
        4. **Language**: Keep the content in KOREAN.

        Original Content:
        ${content}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Content Optimization Error:", error);
        throw new Error("Failed to optimize content.");
    }
}


