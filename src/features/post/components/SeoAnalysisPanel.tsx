"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Copy, Loader2, Sparkles, BarChart } from "lucide-react";
import { AnalyzeSEOResponse } from "@/features/post/actions/analyze-seo";

interface SeoAnalysisPanelProps {
    seoResult: AnalyzeSEOResponse["data"] | null;
    isAnalyzing: boolean;
    isOptimizing: boolean;
    onAnalyze: () => void;
    onOptimize: () => void;
}

export function SeoAnalysisPanel({
    seoResult,
    isAnalyzing,
    isOptimizing,
    onAnalyze,
    onOptimize,
}: SeoAnalysisPanelProps) {
    return (
        <div className="mt-8 space-y-6">
            {!seoResult ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <BarChart className="h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="text-center text-sm text-muted-foreground">
                        아직 분석 결과가 없습니다.<br />
                        버튼을 눌러 분석을 시작하세요.
                    </p>
                    <Button onClick={onAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                분석 중...
                            </>
                        ) : (
                            "SEO 분석 실행"
                        )}
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* SEO Score */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">SEO 점수</h3>
                            <span className={`text-2xl font-bold ${seoResult.seoScore >= 80 ? "text-green-500" : seoResult.seoScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                                {seoResult.seoScore}점
                            </span>
                        </div>
                        <Progress value={seoResult.seoScore} className="h-3" indicatorClassName={seoResult.seoScore >= 80 ? "bg-green-500" : seoResult.seoScore >= 50 ? "bg-yellow-500" : "bg-red-500"} />
                    </div>

                    {/* Meta Data */}
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">추천 메타 제목</p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => {
                                        navigator.clipboard.writeText(seoResult.metaTitle);
                                        toast.success("메타 제목이 복사되었습니다.");
                                    }}
                                    title="복사하기"
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground break-all">{seoResult.metaTitle}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">추천 메타 설명</p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => {
                                        navigator.clipboard.writeText(seoResult.metaDescription);
                                        toast.success("메타 설명이 복사되었습니다.");
                                    }}
                                    title="복사하기"
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground break-all">{seoResult.metaDescription}</p>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">개선 제안</h3>
                        <ul className="space-y-2">
                            {seoResult.suggestions.map((suggestion, i) => (
                                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                    <span className="text-primary">•</span>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t space-y-2">
                        <Button onClick={onAnalyze} disabled={isAnalyzing} variant="outline" className="w-full">
                            {isAnalyzing ? "재분석 중..." : "다시 분석하기"}
                        </Button>
                        <Button onClick={onOptimize} disabled={isOptimizing || isAnalyzing} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
                            {isOptimizing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    최적화 중...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    AI로 본문 최적화하기
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
