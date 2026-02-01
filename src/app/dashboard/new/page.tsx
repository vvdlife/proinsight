// Path: src/app/dashboard/new/page.tsx
"use client";

import { generatePost, generatePostImage, generatePostAudio } from "@/features/generator/actions/generate-post";
import { searchTopic } from "@/features/generator/actions/search-topic";
import { analyzeRival, AnalyzeRivalResult } from "@/features/generator/actions/analyze-rival";
import { Loader2, AlertCircle, CheckCircle2, Globe, Lightbulb, Target, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PostFormValues, postSchema } from "@/lib/schemas/post-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TopicRecommender } from "@/features/generator/components/TopicRecommender";

type Status = "IDLE" | "SEARCHING" | "WRITING" | "COMPLETED";

export const maxDuration = 60;

export default function NewPostPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<Status>("IDLE");

    // Rival Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [rivalAnalysis, setRivalAnalysis] = useState<AnalyzeRivalResult["data"] | null>(null);

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            topic: "",
            keywords: "",
            tone: undefined,
            length: undefined,
            includeImage: false,
            rivalUrl: ""
            // experience removed
        } as any,
    });

    function onSubmit(data: PostFormValues) {
        setStatus("IDLE");

        startTransition(async () => {
            try {
                // Step 1: Search
                setStatus("SEARCHING");
                const searchResult = await searchTopic(data.topic);

                if (!searchResult.success) {
                    toast.error(`Deep Research 실패: ${searchResult.message}`);
                    setStatus("IDLE");
                    return;
                }

                // Step 2: Text Generation (Unified)
                setStatus("WRITING");

                let finalContext = searchResult.context;
                if (rivalAnalysis) {
                    finalContext += `\n\n[COMPETITOR ANALYSIS]\nStrategy: ${rivalAnalysis.strategy}\nWeaknesses: ${rivalAnalysis.weaknesses.join(", ")}\nSuggested Structure: ${rivalAnalysis.structure.join(", ")}`;
                }

                const result = await generatePost(data, finalContext);

                if (result.success && result.postId) {
                    const postId = result.postId;
                    const content = result.content || "";

                    toast.info("글 생성이 완료되었습니다! 미디어를 생성합니다... 🎨🎙️");

                    // Step 3: Parallel Media Generation

                    if (data.includeImage) {
                        generatePostImage(postId, data.topic)
                            .then(res => {
                                if (!res.success) toast.warning("이미지 생성 실패");
                            })
                            .catch(e => console.error("Image gen error", e));
                    }

                    if (content.length > 50) {
                        generatePostAudio(postId, content)
                            .then(res => {
                                if (!res.success) toast.warning("오디오 생성 실패");
                            })
                            .catch(e => console.error("Audio gen error", e));
                    }

                    toast.success("상세 페이지로 이동합니다.");
                    router.push(`/dashboard/post/${result.postId}`);
                } else {
                    toast.error("생성 실패", {
                        description: result.message,
                    });
                    setStatus("IDLE");
                }
            } catch (error) {
                toast.error("오류가 발생했습니다.");
                setStatus("IDLE");
            }
        });
    }

    const handleAnalyzeRival = async () => {
        const url = form.getValues("rivalUrl");
        const topic = form.getValues("topic");

        if (!url) {
            toast.error("경쟁사 URL을 입력해주세요.");
            return;
        }
        if (!topic) {
            toast.error("먼저 주제를 입력해주세요.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await analyzeRival(url, topic);
            if (result.success && result.data) {
                setRivalAnalysis(result.data);
                toast.success("분석 완료!");

                const currentKeywords = form.getValues("keywords");
                if (!currentKeywords && result.data.keywords) {
                    form.setValue("keywords", result.data.keywords.slice(0, 5).join(", "));
                    toast.info("경쟁사 핵심 키워드가 적용되었습니다.");
                }
            } else {
                toast.error(`분석 실패: ${result.message}`);
            }
        } catch (e) {
            toast.error("분석 중 오류 발생");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>새 글 작성</CardTitle>
                    <CardDescription>
                        AI 에이전트가 작성할 글의 주제와 설정을 입력해 주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="topic"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>주제 (Topic)</FormLabel>
                                            <TopicRecommender
                                                onSelectTopic={(topic, keywords) => {
                                                    form.setValue("topic", topic);
                                                    form.setValue("keywords", keywords);
                                                }}
                                            />
                                        </div>
                                        <FormControl>
                                            <Input placeholder="예: 2024년 생성형 AI 트렌드" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            글의 핵심 주제를 5자 이상 입력하세요.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Rival Analysis Section */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="rivalUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-rose-500" />
                                                경쟁사/참고 URL 분석 (Anti-Rival)
                                            </FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input placeholder="https://competitor-blog.com/post-123" {...field} />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleAnalyzeRival}
                                                    disabled={isAnalyzing}
                                                >
                                                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "분석하기"}
                                                </Button>
                                            </div>
                                            <FormDescription>
                                                경쟁 글을 분석하여 더 나은 글을 쓰기 위한 전략과 키워드를 추출합니다.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Analysis Result Display */}
                                {rivalAnalysis && (
                                    <div className="rounded-lg border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <Lightbulb className="h-5 w-5 text-rose-600 mt-1 shrink-0" />
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-rose-700 dark:text-rose-400">
                                                    승리 전략 (Winning Strategy)
                                                </h4>
                                                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                                                    "{rivalAnalysis.strategy}"
                                                </p>

                                                <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-bold text-rose-600 block mb-1">약점 공략 (Weaknesses)</span>
                                                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                                            {rivalAnalysis.weaknesses.map((w, i) => (
                                                                <li key={i}>{w}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-rose-600 block mb-1">추천 구조 (Structure)</span>
                                                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                                            {rivalAnalysis.structure.slice(0, 3).map((s, i) => (
                                                                <li key={i}>{s}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Experience Section Removed */}

                            <FormField
                                control={form.control}
                                name="keywords"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>키워드 (Keywords)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="예: LLM, GPT-4, 자동화 (쉼표로 구분)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="tone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>어조 (Tone)</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="어조 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="professional">전문적인</SelectItem>
                                                    <SelectItem value="friendly">친근한</SelectItem>
                                                    <SelectItem value="witty">위트있는</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="length"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>글 길이 (Length)</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="길이 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="short">짧은 요약 (500자)</SelectItem>
                                                    <SelectItem value="medium">보통 (1000자)</SelectItem>
                                                    <SelectItem value="long">심층 분석 (2000자+)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="includeImage"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">AI 이미지 생성</FormLabel>
                                            <FormDescription>
                                                글 내용에 어울리는 이미지를 함께 생성합니다.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" size="lg" disabled={isPending || status !== "IDLE"}>
                                {status === "SEARCHING" && (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        최신 정보를 검색 중입니다 (Deep Research)...
                                    </>
                                )}
                                {status === "WRITING" && (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        글을 작성하고 있습니다...
                                    </>
                                )}
                                {(status === "IDLE" || status === "COMPLETED") && "생성 시작"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
