import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchTavily } from "./tavily";
import { prisma } from "@/lib/db";

export interface InsightResult {
    title: string;
    summary: string; // 3-line takeaways
    content: string; // The full markdown body
}

/**
 * Searches the web and generates a highly structured investment report
 * mirroring a professional analyst report with strict Markdown requirements.
 */
export async function generateInsightContent(userId: string, topic: string, persona: string): Promise<InsightResult> {
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const apiKey = settings?.apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in user settings or environment variables.");

    // 1. Search Tavily for the latest news on the topic
    const searchData = await searchTavily(`최신 금융 뉴스 및 분석 리포트: ${topic}`);
    
    let searchContext = "";
    if (searchData && searchData.results && searchData.results.length > 0) {
        searchContext = searchData.results
            .map((r: any) => `제목: ${r.title}\n내용: ${r.content}\nURL: ${r.url}`)
            .join("\n\n---\n\n");
    }

    // 2. Setup Gemini Model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    // Define persona instructions
    let personaInstruction = "객관적이고 중립적인 시각으로 거시 경제와 시장에 미치는 영향을 균형있게 분석하세요. (Neutral)";
    if (persona === "AGGRESSIVE") {
        personaInstruction = "단기 수익 창출 기회와 공격적인 롱/숏 전략, 고수익/고위험 테마 픽(Pick)에 집중하는 공격적 투자자 관점에서 분석하세요. (Aggressive)";
    } else if (persona === "DEFENSIVE") {
        personaInstruction = "최악의 시나리오를 가정한 하방 리스크(Drawdown) 통제와 현금 흐름 확보, 배당주 방어 전략을 중점적으로 다루는 보수적 투자자 관점에서 분석하세요. (Defensive)";
    }

    const prompt = `
You are a top-tier Chief AI Analyst at a global investment bank.
Write an in-depth, professional 'Investment Insight Report' about the following topic based on the latest news context provided.

Topic to analyze: "${topic}"

Persona / Strategy Requirements:
${personaInstruction}

--- Required Output Format (CRITICAL) ---
Your output MUST be a valid JSON object matching exactly this structure:
{
    "title": "A highly engaging report title (e.g., '미국-이란 전쟁 고조: 호르무즈 쇼크에 대응하는 투자 전략')",
    "summary": "A 3-line bullet point summary of the 'Key Takeaways'. Format as plain text with newlines.",
    "content": "The full markdown content of the report."
}

--- Markdown Content Requirements (CRITICAL) ---
The 'content' string MUST be a complete markdown document that strictly includes:
1. Professional headings (H2, H3).
2. At least one JSON/Markdown Table comparing sectors (e.g., Beneficiaries vs. Victims).
3. At least one \`mermaid\` code block diagram (graph LR or TD) showing macroeconomic impact or capital flow.
4. Use GitHub Alerts like \`> [!WARNING]\` or \`> [!TIP]\` for important warnings and strategies.
5. Answer 2-3 FAQ questions at the bottom.
Do not include the title or the Key Takeaways in the 'content' body, as they will be rendered separately.
Write entirely in Professional Korean.

Latest News Context:
${searchContext || "No internet context found. Rely on internal knowledge."}
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Failed to parse JSON from AI response", responseText);
            throw new Error("Invalid output format from AI.");
        }

        const data = JSON.parse(jsonMatch[0]) as InsightResult;
        return data;

    } catch (error) {
        console.error("AI Insight Generation Error:", error);
        throw new Error("투자 인사이트 리포트 생성 중 오류가 발생했습니다.");
    }
}
