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

export interface TavilySearchOptions {
    searchDepth?: "basic" | "advanced";
    maxResults?: number;
}

export async function searchTavily(query: string, options?: TavilySearchOptions): Promise<TavilyContext> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        console.warn("TAVILY_API_KEY is not set. Creating empty context.");
        return { results: [], relatedQuestions: [] };
    }

    const depth = options?.searchDepth || "basic";
    const maxResults = options?.maxResults || 5;

    const fetchWithTimeRange = async (timeRange: "day" | "week") => {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: depth,
                include_answer: true,
                include_raw_content: false,
                include_images: false,
                max_results: maxResults,
                time_range: timeRange,
            }),
        });

        if (!response.ok) {
            throw new Error(`Tavily API Error: ${response.statusText}`);
        }

        return await response.json();
    };

    try {
        console.log(`[SearchTavily] Searching with time_range: "day" for query: "${query}"`);
        let data = await fetchWithTimeRange("day");

        if (!data.results || data.results.length === 0) {
            console.log(`[SearchTavily] 0 results found with "day". Retrying with "week"...`);
            data = await fetchWithTimeRange("week");
        }

        return {
            results: data.results.map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content,
                score: r.score,
            })),
            relatedQuestions: [],
        };
    } catch (error) {
        console.error("Tavily Search Failed on 'day'. Retrying with 'week' as fallback...", error);
        try {
            const data = await fetchWithTimeRange("week");
            return {
                results: data.results.map((r: any) => ({
                    title: r.title,
                    url: r.url,
                    content: r.content,
                    score: r.score,
                })),
                relatedQuestions: [],
            };
        } catch (fallbackError) {
            console.error("Tavily Search Failed completely:", fallbackError);
            return { results: [], relatedQuestions: [] };
        }
    }
}
