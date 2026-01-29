import { env } from "process";

export interface SearchResult {
    title: string;
    url: string;
    content: string;
    score: number;
}

export interface SearchResponse {
    query: string;
    answer?: string;
    results: SearchResult[];
}

export async function searchWeb(query: string, depth: "basic" | "advanced" = "advanced"): Promise<SearchResponse> {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        throw new Error("TAVILY_API_KEY is missing. Please add it to your environment variables.");
        // Or return empty to allow graceful degradation?
        // User requested "Information missing -> admit it", but missing KEY is a config error.
        // I'll throw for now so the user knows they need the key.
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
                search_depth: depth, // Configurable depth
                include_answer: true,     // Direct answer from Tavily
                include_raw_content: false, // content is usually enough, raw is too big
                max_results: 5,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tavily API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
            query: data.query,
            answer: data.answer,
            results: data.results.map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content,
                score: r.score
            }))
        };

    } catch (error) {
        console.error("Search Service Error:", error);
        // Rethrow or return empty?
        // The requirement says "만약 검색 결과가 없거나 부족하면... 에러를 반환".
        // If the API fails, it's also a failure to get info.
        throw error;
    }
}
