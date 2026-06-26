import { searchTavily } from "./tavily";
import { prisma } from "@/lib/db";
import { generateOutline, generateSection } from "./ai";
import { PostFormValues } from "@/lib/schemas/post-schema";

export interface InsightResult {
    title: string;
    summary: string; // 3-line takeaways
    content: string; // The full markdown body
}

/**
 * Searches the web and generates a highly structured investment report
 * mirroring a professional analyst report using a multi-step sectional pipeline.
 */
export async function generateInsightContent(userId: string, topic: string, persona: string): Promise<InsightResult> {
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const apiKey = settings?.apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in user settings or environment variables.");

    // 1. Search Tavily for the latest news and macroeconomic indicators in parallel
    console.log(`[InsightGenerator] Performing parallel Tavily searches for topic: ${topic}`);
    const [newsData, macroData] = await Promise.all([
        searchTavily(`최신 금융 뉴스 및 분석 리포트: ${topic}`, { searchDepth: "advanced" }),
        searchTavily(`${topic} 관련 매크로 경제 지표 (금리, 환율, 인플레이션, 원자재 등) 및 시장 영향`, { searchDepth: "advanced" })
    ]);

    let newsContext = "";
    if (newsData && newsData.results && newsData.results.length > 0) {
        newsContext = newsData.results
            .map((r: any) => `제목: ${r.title}\n내용: ${r.content}\nURL: ${r.url}`)
            .join("\n\n---\n\n");
    }

    let macroContext = "";
    if (macroData && macroData.results && macroData.results.length > 0) {
        macroContext = macroData.results
            .map((r: any) => `제목: ${r.title}\n내용: ${r.content}\nURL: ${r.url}`)
            .join("\n\n---\n\n");
    }

    const searchContext = `
=== [최신 뉴스 및 트렌드 데이터] ===
${newsContext || "수집된 뉴스가 없습니다."}

=== [관련 글로벌 매크로 지표 데이터 (금리/환율/원자재/물가 등)] ===
${macroContext || "수집된 매크로 지표 데이터가 없습니다."}
`.trim();

    // Define persona instructions
    let personaInstruction = "객관적이고 중립적인 시각으로 거시 경제와 시장에 미치는 영향을 균형있게 분석하세요. (Neutral)";
    if (persona === "AGGRESSIVE") {
        personaInstruction = "단기 수익 창출 기회와 공격적인 롱/숏 전략, 고수익/고위험 테마 픽(Pick)에 집중하는 공격적 투자자 관점에서 분석하세요. (Aggressive)";
    } else if (persona === "DEFENSIVE") {
        personaInstruction = "최악의 시나리오를 가정한 하방 리스크(Drawdown) 통제와 현금 흐름 확보, 배당주 방어 전략을 중점적으로 다루는 보수적 투자자 관점에서 분석하세요. (Defensive)";
    }

    // Force specific investment report outline sections
    const promptInstructions = `
[중요 투자 분석 보고서 구조 제약 조건]
반드시 다음 순서대로 정확히 6개의 섹션을 설계하고 목차(Outline)를 생성해야 합니다. 다른 임의의 목차를 생성하지 마세요:
1. "Key Takeaways (3줄 요약)"
2. "글로벌 매크로 환경 요약"
3. "거시경제 핵심 지표 및 시장 영향"
4. "투자 전략 및 섹터/종목 비교"
5. "거시경제 전송 채널 다이어그램"
6. "자주 묻는 질문 (FAQ)"

각 섹션별로 작성해야 할 핵심 내용 가이드:
- "거시경제 핵심 지표 및 시장 영향" 섹션에는 거시경제 변수, 현재 상태/트렌드, 주제에 미치는 영향을 비교할 수 있는 표(Table 1: Macroeconomic Indicators Table) 작성이 포함되어야 함.
- "투자 전략 및 섹터/종목 비교" 섹션에는 수혜 분야 vs 피해 분야 또는 다양한 투자 전략 옵션을 비교할 수 있는 표(Table 2: Sector/Strategy Comparison Table) 작성이 포함되어야 함.
- "거시경제 전송 채널 다이어그램" 섹션에는 거시경제 지표 변화가 시장 및 섹터에 미치는 파급 효과를 표현하는 mermaid 흐름도 다이어그램이 반드시 포함되어야 함.
`.trim();

    const modelName = "gemini-3.5-flash";
    const data: PostFormValues = {
        topic: `${topic}\n\n${promptInstructions}`,
        tone: personaInstruction as any,
        length: "long", // 'long' maps to comprehensive post length
        includeImage: false,
        model: modelName
    };

    try {
        // 2. Generate Outline (Step 1)
        console.log(`[InsightGenerator] Designing outline using ${modelName}...`);
        const outline = await generateOutline(data, searchContext, apiKey, modelName);
        console.log(`[InsightGenerator] Outline designed: "${outline.title}" with ${outline.sections.length} sections.`);

        // 3. Generate Sections (Step 2)
        const CONCURRENCY_LIMIT = 3;
        const sectionContents: string[] = new Array(outline.sections.length).fill("");

        for (let i = 0; i < outline.sections.length; i += CONCURRENCY_LIMIT) {
            const batch = outline.sections.slice(i, i + CONCURRENCY_LIMIT);
            console.log(`[InsightGenerator] Processing Section Batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1} (${batch.length} sections)...`);

            await Promise.all(batch.map(async (section, batchIndex) => {
                const globalIndex = i + batchIndex;
                console.log(`[InsightGenerator] Writing Section ${globalIndex + 1}/${outline.sections.length}: ${section.heading}...`);
                try {
                    const content = await generateSection(data, section, searchContext, apiKey, modelName);
                    sectionContents[globalIndex] = content;
                    console.log(`[InsightGenerator] Section ${globalIndex + 1} Completed.`);
                } catch (error) {
                    console.error(`[InsightGenerator] Section ${globalIndex + 1} Failed:`, error);
                    sectionContents[globalIndex] = `## ${section.heading}\n\n(본 섹션은 생성 중 오류가 발생했습니다.)`;
                }
            }));
        }

        // 4. Assemble and Separate Outputs
        const title = outline.title;

        // Extract Summary (Key Takeaways) from the first section
        // Strip markdown header from sectionContents[0]
        const rawSummary = sectionContents[0] || "";
        const summary = rawSummary.replace(/^##?\s*.*?\n/, "").trim();

        // Assemble content from section 2 onwards (excluding Section 0)
        const bodyContent = sectionContents.slice(1).join("\n\n");

        // Parse references from the newsData and macroData
        let referencesSection = "\n\n## References\n";
        const allReferences: { title: string, url: string }[] = [];

        if (newsData?.results) {
            newsData.results.forEach((r: any) => {
                if (r.title && r.url && !allReferences.some(ref => ref.url === r.url)) {
                    allReferences.push({ title: r.title, url: r.url });
                }
            });
        }
        if (macroData?.results) {
            macroData.results.forEach((r: any) => {
                if (r.title && r.url && !allReferences.some(ref => ref.url === r.url)) {
                    allReferences.push({ title: r.title, url: r.url });
                }
            });
        }

        if (allReferences.length > 0) {
            allReferences.forEach((ref, index) => {
                referencesSection += `[${index + 1}] ${ref.title}: ${ref.url}\n\n`;
            });
        } else {
            referencesSection += "No references detected from search context.\n";
        }

        const disclaimer = `
> ⚖️ **Investment Disclaimer (투자 면책 고지)**
> 
> 본 콘텐츠는 제공자가 주식 시장의 공개된 지표와 매크로 데이터를 바탕으로 분석한 정보성 분석 글이며, 특정 종목에 대한 매수 또는 매도 추천을 목적으로 하지 않습니다. 
> 
> 본 글에 포함된 수치, 전망 및 분석 결과는 미래의 수익을 보장하지 않으며, 거시경제 환경 및 정부 정책(관세, 통화정책 등)의 변동에 따라 언제든지 달라질 수 있습니다. 모든 투자 결정의 최종 책임은 투자자 본인에게 있으며, 본 콘텐츠는 어떠한 경우에도 투자 결과에 대한 법적 책임 소지의 증빙자료로 사용될 수 없습니다. 보수적인 분할 매수 관점과 철저한 리스크 관리를 권장합니다.
`.trim();

        const content = `${bodyContent}\n\n${referencesSection}\n\n---\n\n${disclaimer}`;

        return {
            title,
            summary,
            content
        };

    } catch (error) {
        console.error("AI Insight Generation Error:", error);
        throw new Error("투자 인사이트 리포트 생성 중 오류가 발생했습니다.");
    }
}
