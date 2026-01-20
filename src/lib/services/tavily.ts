// Path: src/lib/services/tavily.ts
export interface TavilyResult {
    title: string;
    url: string;
    content: string;
    score: number;
}

export interface TavilyContext {
    results: TavilyResult[];
    relatedQuestions: string[]; // "People Also Ask"
}

export async function searchTavily(query: string): Promise<TavilyContext> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        console.warn("TAVILY_API_KEY is not set. Creating empty context.");
        return { results: [], relatedQuestions: [] };
    }

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "basic",
                include_answer: true,
                include_raw_content: false,
                include_images: false,
                // Asking for Q&A style data implicitly via content analysis
                // Tavily API might not have explicit "related questions" field in basic tier,
                // but we can extract insights from 'results'.
                // However, let's stick to standard Tavily search response structure.
            }),
        });

        if (!response.ok) {
            throw new Error(`Tavily API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract relevant data
        // Note: Tavily actually returns 'results' array.
        // It doesn't strictly separate "People Also Ask" in the basic search endpoint unless using specific options.
        // For this implementation, we will treat the search results as the context.
        // To get "questions", we might need a separate call or specific prompt to Gemini to extract questions from this context.
        // BUT, for Better SEO, we can assume the user wants the context to find WHAT people are asking.

        return {
            results: data.results.map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content,
                score: r.score,
            })),
            relatedQuestions: [], // Placeholder if valid API field isn't available directly
        };
    } catch (error) {
        console.error("Tavily Search Failed:", error);
        return { results: [], relatedQuestions: [] };
    }
}
