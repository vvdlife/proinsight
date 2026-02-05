"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalyzeSEOResponse } from "@/features/post/actions/analyze-seo";
import { Loader2, RefreshCw, Eye, Code, BarChart3, Settings } from "lucide-react";
import { SeoScoreDial } from "./SeoScoreDial";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { analyzeLocalSEO } from "@/lib/services/seo-local-analyzer";
import { SerpSimulator } from "./SerpSimulator";
import { JsonLdSandbox } from "./JsonLdSandbox";

interface SeoDashboardProps {
    content: string;
    topic: string;
    schemaMarkup?: string | null;
    seoResult: AnalyzeSEOResponse["data"] | null;
    isAnalyzing: boolean;
    isOptimizing: boolean;
    onAnalyze: () => void;
    onOptimize: () => void;
}

export function SeoDashboard({
    content,
    topic,
    schemaMarkup,
    seoResult,
    isAnalyzing,
    isOptimizing,
    onAnalyze,
    onOptimize,
}: SeoDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview");

    // Local Analysis (Real-time)
    const localAnalysis = useMemo(() => {
        return analyzeLocalSEO(content, topic);
    }, [content, topic]);

    // Combined Score: 50% Local + 50% AI (if available). If no AI, just Local.
    const displayScore = seoResult
        ? Math.round((localAnalysis.totalScore + seoResult.seoScore) / 2)
        : localAnalysis.totalScore;

    // Combined Suggestions
    const combinedSuggestions = [
        ...localAnalysis.issues,
        ...(seoResult?.suggestions || [])
    ];

    if (!seoResult && localAnalysis.issues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center border rounded-lg bg-muted/20 border-dashed">
                <div className="p-4 rounded-full bg-background border shadow-sm">
                    <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">SEO 분석이 필요합니다</h3>
                    <p className="text-sm text-muted-foreground">
                        현재 글의 SEO 상태를 진단하고 최적화 제안을 받아보세요.
                    </p>
                </div>
                <Button onClick={onAnalyze} disabled={isAnalyzing} size="lg">
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            분석 중...
                        </>
                    ) : (
                        "SEO 분석 시작하기"
                    )}
                </Button>
            </div>
        );
    }

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>SEO 대시보드</CardTitle>
                        <CardDescription>
                            가독성: {localAnalysis.readabilityScore}점 • 키워드 밀도: {localAnalysis.keywordDensity.toFixed(1)}%
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAnalyze}
                        disabled={isAnalyzing}
                        className="h-8 gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                        재분석
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="overview" className="gap-2">
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">종합 점수</span>
                        </TabsTrigger>
                        <TabsTrigger value="meta" className="gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">메타 데이터</span>
                        </TabsTrigger>
                        <TabsTrigger value="visuals" className="gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">시각적 도구</span>
                        </TabsTrigger>
                        <TabsTrigger value="schema" className="gap-2">
                            <Code className="w-4 h-4" />
                            <span className="hidden sm:inline">스키마</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* 1. Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-shrink-0">
                                <SeoScoreDial score={displayScore} />
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm flex items-center justify-between">
                                        개선 제안 (Local {localAnalysis.issues.length} + AI {seoResult?.suggestions.length || 0})
                                        <Badge variant="outline">{combinedSuggestions.length}개 항목</Badge>
                                    </h4>
                                    <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                        {combinedSuggestions.map((item, idx) => (
                                            <li key={idx} className="text-sm text-muted-foreground flex gap-2 items-start bg-muted/50 p-2 rounded">
                                                <span className="text-primary mt-0.5">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {!seoResult && (
                            <div className="p-4 border border-blue-200 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
                                <p>💡 <strong>AI 심층 분석</strong>을 실행하면 E-E-A-T 및 메타 데이터 제안을 받을 수 있습니다.</p>
                            </div>
                        )}

                        <Button
                            onClick={seoResult ? onOptimize : onAnalyze}
                            disabled={isOptimizing || isAnalyzing}
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    AI 분석 중...
                                </>
                            ) : isOptimizing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    최적화 중...
                                </>
                            ) : seoResult ? (
                                "✨ 원클릭 AI 최적화"
                            ) : (
                                "🔍 AI 심층 분석 실행"
                            )}
                        </Button>
                    </TabsContent>

                    {/* 2. Meta Data Tab */}
                    <TabsContent value="meta" className="space-y-4">
                        <div className="space-y-4 border p-4 rounded-lg bg-card/50">
                            {seoResult ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Meta Title (HTML Title)</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 p-2 bg-muted rounded text-sm break-all font-mono">
                                                {seoResult.metaTitle}
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(seoResult.metaTitle);
                                                    toast.success("복사되었습니다");
                                                }}
                                            >
                                                <Code className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-right">
                                            {seoResult.metaTitle.length} / 60자 (적정)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Meta Description</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 p-2 bg-muted rounded text-sm break-all font-mono">
                                                {seoResult.metaDescription}
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(seoResult.metaDescription);
                                                    toast.success("복사되었습니다");
                                                }}
                                            >
                                                <Code className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-right">
                                            {seoResult.metaDescription.length} / 160자 (적정)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Target Keywords</label>
                                        <div className="flex flex-wrap gap-2">
                                            {seoResult.keywords.map((kw, i) => (
                                                <Badge key={i} variant="secondary">{kw}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    AI 분석 후 메타 데이터를 확인할 수 있습니다.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* 3. Visuals Tab (SERP Simulator) */}
                    <TabsContent value="visuals">
                        <SerpSimulator
                            title={seoResult?.metaTitle || topic}
                            description={seoResult?.metaDescription || content.substring(0, 160)}
                            url="proinsight-ai.com"
                        />
                    </TabsContent>

                    {/* 4. Schema Tab (JSON-LD) */}
                    <TabsContent value="schema">
                        <JsonLdSandbox schemaMarkup={schemaMarkup || null} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
