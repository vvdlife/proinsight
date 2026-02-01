// Path: src/app/dashboard/new/page.tsx
"use client";

import { generatePostStep1Outline, generatePostStep2Section, generatePostStep3Finalize, generatePostImage } from "@/features/generator/actions/generate-post";
import { searchTopic } from "@/features/generator/actions/search-topic";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Progress } from "@/components/ui/progress";

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

type Status = "IDLE" | "SEARCHING" | "PLANNING" | "WRITING" | "SAVING" | "COMPLETED";

export const maxDuration = 60;

export default function NewPostPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<Status>("IDLE");
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("");

    // Rival Analysis Removed

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema) as any, // Cast to any to avoid strict type mismatch with RHF
        defaultValues: {
            topic: "",
            keywords: "",
            tone: undefined,
            length: undefined,
            includeImage: true,
            // rivalUrl removed
            model: "gemini-1.5-flash",
        },
    });

    const onSubmit: import("react-hook-form").SubmitHandler<PostFormValues> = (data) => {
        setStatus("IDLE");
        setProgress(0);
        setProgressMessage("");

        startTransition(async () => {
            try {
                // Step 1: Search
                setStatus("SEARCHING");
                setProgress(10);
                setProgressMessage("최신 트렌드와 정보를 분석하고 있습니다...");

                const searchResult = await searchTopic(data.topic);

                if (!searchResult.success) {
                    toast.error(`Deep Research 실패: ${searchResult.message}`);
                    setStatus("IDLE");
                    return;
                }
                const finalContext = searchResult.context;

                // Step 2: Outline & Early Post Creation
                setStatus("PLANNING");
                setProgress(30);
                setProgressMessage("블로그 글의 목차와 전략을 수립하고 있습니다...");

                const outlineResult = await generatePostStep1Outline(data, finalContext);
                if (!outlineResult.success || !outlineResult.outline || !outlineResult.postId) {
                    toast.error("목차 생성 실패: " + outlineResult.message);
                    setStatus("IDLE");
                    return;
                }
                const outline = outlineResult.outline;
                const postId = outlineResult.postId;

                // 🚀 Parallel Image Generation Trigger
                if (data.includeImage) {
                    console.log("🎨 Triggering Parallel Image Generation...");
                    generatePostImage(postId, data.topic).catch(err => console.error("Parallel Image Gen Failed:", err));
                    toast.info("이미지 생성이 백그라운드에서 시작되었습니다. 🎨");
                }

                // Step 3: Write Sections (Client-Side Orchestration)
                setStatus("WRITING");
                const sectionContents: string[] = [];
                const totalSections = outline.sections.length;

                // Sequential or Paralllel? 
                // To safely avoid 504 on Client-Side (Next.js limits), sequential or small batches is safest for the overall process,
                // BUT browsers have no timeouts for fetch usually, Vercel Server Actions DO have 60s limit *per request*.
                // So calling multiple server actions in parallel is fine as long as EACH action < 60s.
                // However, too many parallel requests might hit AI rate limits.
                // Pro model is slow. Let's do strictly sequential for Pro, batch 2 for Flash.
                // For simplicity and safety (as requested "Zero-Timeout"), let's do SEQUENTIAL. 
                // It ensures we never hit rate limits and users see steady progress.

                for (let i = 0; i < totalSections; i++) {
                    const section = outline.sections[i];
                    const progressPercent = 30 + Math.floor(((i) / totalSections) * 50); // 30% -> 80%
                    setProgress(progressPercent);
                    setProgressMessage(`섹션 ${i + 1}/${totalSections} 작성 중: ${section.heading}`);

                    const sectionResult = await generatePostStep2Section(data, section, finalContext, data.model);
                    if (!sectionResult.success || !sectionResult.content) {
                        // Fallback for failed section
                        sectionContents.push(`## ${section.heading}\n\n(작성 실패: ${sectionResult.message})`);
                    } else {
                        sectionContents.push(sectionResult.content!);
                    }
                }

                // Step 4: Finalize
                setStatus("SAVING");
                setProgress(90);
                setProgressMessage("전체 내용을 조립하고 저장하고 있습니다...");

                // Pass existing postId to update it
                const postResult = await generatePostStep3Finalize(data, outline, sectionContents, outlineResult.seoStrategy, postId, finalContext);

                if (postResult.success && postResult.postId) {
                    setProgress(100);
                    setProgressMessage("완료! 상세 페이지로 이동합니다...");

                    toast.success("글 생성이 완료되었습니다!");
                    router.push(`/dashboard/post/${postResult.postId}`);
                } else {
                    throw new Error(postResult.message);
                }

            } catch (error: any) {
                console.error(error);
                toast.error("오류가 발생했습니다: " + error.message);
                setStatus("IDLE");
            }
        });
    }

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

                            {/* Rival Analysis Section Removed */}

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
                                                value={field.value}
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
                                                value={field.value}
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

                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>AI 모델 설정 (Model)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="모델 선택" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="gemini-1.5-flash">
                                                    <span className="font-medium">⚡ Gemini 1.5 Flash</span>
                                                    <span className="text-xs text-muted-foreground ml-2">(빠름 / 안정적)</span>
                                                </SelectItem>
                                                <SelectItem value="gemini-3-pro-preview">
                                                    <span className="font-medium">🧠 Gemini 3 Pro</span>
                                                    <span className="text-xs text-muted-foreground ml-2">(고지능 / 느림)</span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Pro 모델은 품질이 높지만 60초 이상 소요될 수 있습니다.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                {status !== "IDLE" && status !== "COMPLETED" && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                            <span>{progressMessage}</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                )}

                                <Button type="submit" className="w-full" size="lg" disabled={isPending || status !== "IDLE"}>
                                    {status !== "IDLE" ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {status === "SEARCHING" ? "정보 검색 중..." :
                                                status === "PLANNING" ? "목차 생성 중..." :
                                                    status === "WRITING" ? "본문 작성 중..." :
                                                        status === "SAVING" ? "저장 중..." : "처리 중..."}
                                        </>
                                    ) : (
                                        "생성 시작"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
