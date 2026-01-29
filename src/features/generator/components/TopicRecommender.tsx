// Path: src/features/generator/components/TopicRecommender.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { recommendTopicsAction } from "../actions/recommend-topics";
import { toast } from "sonner";
import { RecommendedTopic } from "@/lib/services/ai";

interface TopicRecommenderProps {
    onSelectTopic: (topic: string, keywords: string) => void;
}

const CATEGORIES = [
    { value: "Technology & IT", label: "기술 / IT" },
    { value: "Economy & Finance", label: "경제 / 금융" },
    { value: "Startup & Business", label: "스타트업 / 비즈니스" },
    { value: "Health & Wellness", label: "건강 / 웰니스" },
    { value: "Science & Future", label: "과학 / 미래기술" },
    { value: "Marketing & Social Media", label: "마케팅 / 트렌드" },
];

export function TopicRecommender({ onSelectTopic }: TopicRecommenderProps) {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState("Technology & IT");
    const [topics, setTopics] = useState<RecommendedTopic[]>([]);
    const [isPending, startTransition] = useTransition();

    const handleRecommend = () => {
        setTopics([]); // Reset previous results
        startTransition(async () => {
            const result = await recommendTopicsAction(category);
            if (result.success && result.topics) {
                setTopics(result.topics);
            } else {
                toast.error("주제 추천 실패", {
                    description: result.message || "다시 시도해 주세요.",
                });
            }
        });
    };

    const handleSelect = (t: RecommendedTopic) => {
        onSelectTopic(t.topic, t.keywords);
        setOpen(false);
        toast.success("주제가 적용되었습니다!", {
            description: `"${t.topic}"`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950">
                    <Sparkles className="h-4 w-4" />
                    AI 추천 주제
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <TrendingUp className="h-6 w-6 text-indigo-500" />
                        최신 트렌드 기반 주제 추천
                    </DialogTitle>
                    <DialogDescription>
                        관심 분야를 선택하면 AI가 실시간 검색을 통해 블로그 주제를 제안합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center bg-muted/30 p-4 rounded-lg border">
                        <div className="flex flex-col gap-2 flex-1 w-full">
                            <label className="text-sm font-medium text-foreground/80">
                                관심 카테고리
                            </label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleRecommend}
                            disabled={isPending}
                            className="w-full sm:w-auto"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    트렌드 분석 중...
                                </>
                            ) : (
                                "추천 받기"
                            )}
                        </Button>
                    </div>

                    {/* Results Grid */}
                    <div className="space-y-4">
                        {isPending && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-pulse">
                                <div className="space-y-2">
                                    <div className="h-4 w-48 bg-muted rounded mx-auto" />
                                    <div className="h-3 w-32 bg-muted/60 rounded mx-auto" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    최신 뉴스를 검색하고 인사이트를 도출하고 있습니다...
                                </p>
                            </div>
                        )}

                        {!isPending && topics.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {topics.map((item, idx) => (
                                    <Card
                                        key={idx}
                                        className="group cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all duration-200 border-dashed"
                                        onClick={() => handleSelect(item)}
                                    >
                                        <CardHeader className="space-y-3 pb-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                    추천 {idx + 1}
                                                </Badge>
                                                <CheckCircle2 className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 transition-opacity" />
                                            </div>
                                            <CardTitle className="text-lg leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {item.topic}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {item.reason}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1">
                                                {item.keywords.split(",").map((k, kIdx) => (
                                                    <span key={kIdx} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                                        #{k.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {!isPending && topics.length === 0 && !open && (
                            <div className="text-center py-12 text-muted-foreground">
                                "추천 받기" 버튼을 눌러보세요.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
