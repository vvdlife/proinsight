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

    const TIMEOUT_MS = 15000; // 15 seconds max for Tavily

    try {
        const fetchWithTimeout = async (depthOverride?: "basic") => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

            try {
                const response = await fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        query: query,
                        search_depth: depthOverride || depth, // Use override if provided
                        include_answer: true,
                        include_raw_content: false,
                        max_results: 5,
                    }),
                    signal: controller.signal,
                });
                clearTimeout(id);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Tavily API Error: ${response.status} - ${errorText}`);
                }

                return await response.json();
            } catch (err) {
                clearTimeout(id);
                throw err;
            }
        };

        let data;
        try {
            // First try with requested depth (advanced)
            data = await fetchWithTimeout();
        } catch (error: any) {
            console.warn(`Initial search failed or timed out: ${error.message}`);
            if (depth === "advanced" && (error.name === 'AbortError' || error.message.includes('timeout'))) {
                // Retry with basic depth which is faster
                console.log("Falling back to 'basic' search depth...");
                data = await fetchWithTimeout("basic");
            } else {
                throw error;
            }
        }

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
        throw error;
    }
}
