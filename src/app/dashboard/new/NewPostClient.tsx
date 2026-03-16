"use client";

import { generatePostStep1Outline, generatePostStep2Section, generatePostStep3Finalize, generatePostImage } from "@/features/generator/actions/generate-post";
import { searchTopic } from "@/features/generator/actions/search-topic";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
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
import { StudioSidebar, StudioStep } from "@/features/generator/components/StudioSidebar";
import { LivePreview } from "@/features/generator/components/LivePreview";
import { motion, AnimatePresence } from "framer-motion";
import { ReferenceUploader } from "@/features/editor/components/ReferenceUploader";
import { Attachment } from "@/lib/types/attachment";

// Streaming States
interface StreamSection {
    id: string;
    heading: string;
    content: string | null;
    status: 'pending' | 'writing' | 'done' | 'error';
}

export default function NewPostClient() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Mode: INPUT (Form) -> STUDIO (Streaming)
    const [mode, setMode] = useState<"INPUT" | "STUDIO">("INPUT");

    // Studio State
    const [status, setStatus] = useState<StudioStep>("IDLE");
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [liveSections, setLiveSections] = useState<StreamSection[]>([]);
    const [postTitle, setPostTitle] = useState("");
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema) as any,
        defaultValues: {
            topic: "",
            keywords: "",
            tone: undefined,
            length: undefined,
            includeImage: true,
            model: "gemini-3.1-flash-lite-preview",
        },
    });

    const onSubmit: import("react-hook-form").SubmitHandler<PostFormValues> = (data) => {
        // Switch to Studio Mode immediately
        setMode("STUDIO");
        setStatus("SEARCHING");
        setProgress(5);
        setLogs([]); // Clear logs
        addLog("Initializing Creation Studio...");
        addLog(`Target Topic: ${data.topic}`);
        setPostTitle(data.topic);

        startTransition(async () => {
            try {
                // Step 1: Search
                addLog("Starting Deep Research...");
                const searchResult = await searchTopic(data.topic);

                if (!searchResult.success) {
                    toast.error(`Deep Research 실패: ${searchResult.message}`);
                    addLog(`Error: ${searchResult.message}`);
                    setStatus("IDLE"); // Or Error state
                    return;
                }
                addLog("Research analysis completed.");
                const finalContext = searchResult.context;

                // Step 2: Outline & Early Post Creation
                setStatus("PLANNING");
                setProgress(20);
                addLog("Drafting structural outline...");

                const outlineResult = await generatePostStep1Outline(data, finalContext, attachments);
                if (!outlineResult.success || !outlineResult.outline || !outlineResult.postId) {
                    toast.error("목차 생성 실패: " + outlineResult.message);
                    addLog(`Error: ${outlineResult.message}`);
                    return;
                }

                const outline = outlineResult.outline;
                const postId = outlineResult.postId;
                addLog(`Outline generated: ${outline.title}`);
                setPostTitle(outline.title);

                // Initialize Live Sections
                const initialSections: StreamSection[] = outline.sections.map((sec, idx) => ({
                    id: `sec-${idx}`,
                    heading: sec.heading,
                    content: null,
                    status: 'pending'
                }));
                setLiveSections(initialSections);

                // 🚀 Parallel Image Generation Trigger
                if (data.includeImage) {
                    addLog("Triggering background image generation...");
                    generatePostImage(postId, data.topic).catch(err => console.error("Parallel Image Gen Failed:", err));
                }

                // Step 3: Write Sections (Chunked Streaming)
                setStatus("WRITING");
                const totalSections = outline.sections.length;
                const sectionContents: string[] = [];

                for (let i = 0; i < totalSections; i++) {
                    const section = outline.sections[i];

                    // Mark current as writing
                    setLiveSections(prev => {
                        const next = [...prev];
                        next[i].status = "writing";
                        return next;
                    });
                    addLog(`Writing Section ${i + 1}/${totalSections}: ${section.heading}...`);

                    // Update progress
                    const progressPercent = 30 + Math.floor(((i) / totalSections) * 50);
                    setProgress(progressPercent);

                    // Call Server Action with Retry Logic
                    let sectionResult: { success: boolean; content?: string; message?: string } = { success: false, content: undefined, message: "초기화됨" };
                    let retryCount = 0;
                    const maxRetries = 2; // Total 3 attempts (1 initial + 2 retries)

                    while (retryCount <= maxRetries) {
                        sectionResult = await generatePostStep2Section(data, section, finalContext, data.model, attachments);
                        
                        if (sectionResult.success && sectionResult.content) {
                            break; // Success! Exit retry loop
                        }
                        
                        retryCount++;
                        if (retryCount <= maxRetries) {
                            addLog(`⚠️ Section ${i + 1} Failed. Retrying (${retryCount}/${maxRetries})...`);
                            // Wait for 2 seconds before retrying (to handle rate limits)
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }

                    const content = (sectionResult.success && sectionResult.content)
                        ? sectionResult.content
                        : `## ${section.heading}\n\n(작성 실패: ${sectionResult.message || "최대 재시도 횟수 초과"})`;

                    sectionContents.push(content!);

                    // Mark current as done and update content
                    setLiveSections(prev => {
                        const next = [...prev];
                        next[i].status = "done";
                        next[i].content = content!;
                        return next;
                    });
                    addLog(`Section ${i + 1} completed.`);
                }

                // Step 4: Finalize
                setStatus("SAVING");
                setProgress(95);
                addLog("Assembling final document...");

                const postResult = await generatePostStep3Finalize(data, outline, sectionContents, outlineResult.seoStrategy, postId, finalContext, attachments);

                if (postResult.success && postResult.postId) {
                    setStatus("COMPLETED");
                    setProgress(100);
                    addLog("All tasks completed successfully. Redirecting...");

                    toast.success("글 생성이 완료되었습니다!");
                    // Slight delay to let user see 100%
                    setTimeout(() => {
                        router.push(`/dashboard/post/${postResult.postId}`);
                    }, 1000);
                } else {
                    throw new Error(postResult.message);
                }

            } catch (error: any) {
                console.error(error);
                toast.error("오류가 발생했습니다: " + error.message);
                addLog(`Critical Error: ${error.message}`);
                // setStatus("ERROR"); // Needs error handling in sidebar
            }
        });
    }

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // Render nothing until mounted to prevent hydration errors
    }

    return (
        <div className="h-[calc(100dvh-4rem)] md:h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col md:flex-row relative">
            <AnimatePresence mode="wait">
                {/* Mode: INPUT */}
                {mode === "INPUT" && (
                    <motion.div
                        key="input-mode"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full h-full overflow-y-auto p-4"
                    >
                        <div className="flex min-h-full items-center justify-center py-8">
                            <Card className="w-full max-w-2xl border-none shadow-xl bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl">새 글 작성</CardTitle>
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
                                                            <Input placeholder="예: 2024년 생성형 AI 트렌드" {...field} className="h-11" />
                                                        </FormControl>
                                                        <FormDescription>
                                                            글의 핵심 주제를 5자 이상 입력하세요.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

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
                                                                value={field.value || ""}
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
                                                                value={field.value || ""}
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

                                            {/* Reference Uploader */}
                                            <div className="space-y-2">
                                                <ReferenceUploader
                                                    attachments={attachments}
                                                    onChange={setAttachments}
                                                />
                                            </div>

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
                                                                <SelectItem value="gemini-3.1-flash-lite-preview">
                                                                    <span className="font-medium">⚡ Gemini 3.1 Flash Lite</span>
                                                                    <span className="text-xs text-muted-foreground ml-2">(Preview / 초고속)</span>
                                                                </SelectItem>
                                                                <SelectItem value="gemini-3.1-pro-preview">
                                                                    <span className="font-medium">🧠 Gemini 3.1 Pro</span>
                                                                    <span className="text-xs text-muted-foreground ml-2">(고지능 / 느림)</span>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            Flash Lite 모델은 품질이 준수하면서도 응답 속도가 매우 빠릅니다. (Pro 대비 약 3~5배 빠름)
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button type="submit" className="w-full text-lg h-12" size="lg">
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin hidden" /> {/* Hidden loader, handle by state transition */}
                                                Create Content
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* Mode: STUDIO */}
                {mode === "STUDIO" && (
                    <motion.div
                        key="studio-mode"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full h-full flex flex-col md:flex-row"
                    >
                        {/* Left: Sidebar */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-full h-1/3 md:w-80 md:h-full md:shrink-0 order-2 md:order-1"
                        >
                            <StudioSidebar status={status} progress={progress} logs={logs} />
                        </motion.div>

                        {/* Right: Live Preview */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="flex-1 h-2/3 md:h-full overflow-hidden order-1 md:order-2 bg-background relative shadow-2xl"
                        >
                            <LivePreview
                                title={postTitle}
                                sections={liveSections}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
