export interface LocalSeoScore {
    readabilityScore: number;
    keywordDensity: number;
    headingStructureScore: number;
    linkHealthScore: number;
    totalScore: number;
    details: {
        wordCount: number;
        sentenceCount: number;
        missingAltTags: number;
        brokenLinks: number; // Placeholder for now
    };
    issues: string[];
}

/**
 * Calculate Flesch Reading Ease for Korean (Adjusted)
 * Since Korean structure is different, we use sentence length and word complexity heuristics.
 */
function calculateKoreanReadability(text: string): number {
    const sentences = text.split(/[.?!]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    // Simple heuristic: Longer sentences are harder. Perfect length is around 10-15 words.
    // Score starts at 100, penalties for long sentences.

    let score = 100 - (avgSentenceLength - 10) * 2;
    return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Analyze Header Structure (H1 -> H2 -> H3)
 */
function analyzeHeadingStructure(content: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    const h1Count = (content.match(/^#\s/gm) || []).length;
    const h2Count = (content.match(/^##\s/gm) || []).length;

    let score = 100;

    if (h1Count === 0) {
        issues.push("H1 태그(제목)가 감지되지 않았습니다.");
        score -= 20;
    } else if (h1Count > 1) {
        issues.push("H1 태그는 하나만 있어야 합니다.");
        score -= 10;
    }

    if (h2Count === 0) {
        issues.push("본문 구조화를 위해 H2 태그를 사용하세요.");
        score -= 20;
    }

    return { score: Math.max(0, score), issues };
}

export function analyzeLocalSEO(content: string, keyword?: string): LocalSeoScore {
    const issues: string[] = [];
    const text = content.replace(/[#*`\[\]()-]/g, " "); // Strip markdown chars roughly
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);

    // 1. Readability
    const readabilityScore = calculateKoreanReadability(text);
    if (readabilityScore < 50) {
        issues.push("문장이 너무 깁니다. 더 짧고 간결하게 작성하세요.");
    }

    // 2. Keyword Density (if keyword provided)
    let keywordDensity = 0;
    let keywordScore = 100;

    if (keyword) {
        const keywordCount = (text.match(new RegExp(keyword, "gi")) || []).length;
        keywordDensity = (keywordCount / words.length) * 100;

        if (keywordDensity < 0.5) {
            issues.push(`키워드 '${keyword}' 밀도가 너무 낮습니다. (${keywordDensity.toFixed(1)}%)`);
            keywordScore = 50;
        } else if (keywordDensity > 3.0) {
            issues.push(`키워드 밀도가 너무 높습니다 (스팸 가능성). 적정 수준(1-2%)으로 줄이세요.`);
            keywordScore = 60;
        }
    }

    // 3. Heading Structure
    const structure = analyzeHeadingStructure(content);
    issues.push(...structure.issues);

    // 4. Image Alt Tags
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let missingAltTags = 0;
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
        if (match[1].trim().length === 0) {
            missingAltTags++;
        }
    }

    let linkHealthScore = 100;
    if (missingAltTags > 0) {
        issues.push(`${missingAltTags}개의 이미지에 Alt 텍스트가 없습니다.`);
        linkHealthScore -= (missingAltTags * 10);
    }

    // Total Calculation (Simple Average for now)
    const totalScore = Math.round((readabilityScore + keywordScore + structure.score + Math.max(0, linkHealthScore)) / 4);

    return {
        readabilityScore,
        keywordDensity,
        headingStructureScore: structure.score,
        linkHealthScore: Math.max(0, linkHealthScore),
        totalScore,
        details: {
            wordCount: words.length,
            sentenceCount: text.split(/[.?!]+/).length,
            missingAltTags,
            brokenLinks: 0,
        },
        issues,
    };
}
