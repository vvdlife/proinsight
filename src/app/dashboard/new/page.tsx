// Path: src/app/dashboard/new/page.tsx
"use client";

import { generatePost } from "@/features/generator/actions/generate-post";
import { Loader2 } from "lucide-react";
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
import { MarkdownViewer } from "@/components/markdown-viewer";

export default function NewPostPage() {
    const [isPending, startTransition] = useTransition();
    const [generatedContent, setGeneratedContent] = useState<string>("");

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            topic: "",
            keywords: "",
            tone: undefined,
            length: undefined,
            includeImage: false,
        } as any,
    });

    function onSubmit(data: PostFormValues) {
        startTransition(async () => {
            const result = await generatePost(data);

            if (result.success) {
                toast.success(`생성 완료!`, {
                    description: result.message,
                });
                if (result.content) {
                    setGeneratedContent(result.content);
                }
            } else {
                toast.error("생성 실패", {
                    description: result.message,
                });
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
                                        <FormLabel>주제 (Topic)</FormLabel>
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

                            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        생성 중...
                                    </>
                                ) : (
                                    "생성 시작"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {generatedContent && (
                <Card className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle>생성된 초안 (Draft)</CardTitle>
                        <CardDescription>
                            AI가 작성한 초안입니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MarkdownViewer content={generatedContent} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
