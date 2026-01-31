"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveApiKey } from "@/features/settings/actions/save-api-key";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";

export function OnboardingForm() {
    const [apiKey, setApiKey] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!apiKey.trim()) {
            toast.error("API Key를 입력해주세요.");
            return;
        }

        if (!apiKey.startsWith("AIza")) {
            toast.warning("유효하지 않은 API Key 형식 같습니다. (AIza...로 시작)", {
                description: "그래도 저장을 시도합니다."
            });
        }

        startTransition(async () => {
            const result = await saveApiKey(apiKey);
            if (result.success) {
                toast.success("환영합니다! 준비가 완료되었습니다.");
                router.push("/dashboard");
                router.refresh();
            } else {
                toast.error("저장 실패", { description: result.message });
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
            <div className="mb-8 flex flex-col items-center gap-4">
                <div className="relative h-16 w-16">
                    <Image
                        src="/logo.png"
                        alt="ProInsight Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-center">ProInsight</h1>
            </div>

            <Card className="w-full max-w-md shadow-lg border-2">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Key className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">시작하기 전에</CardTitle>
                    <CardDescription>
                        AI 콘텐츠 생성을 위해 Google Gemini API Key가 필요합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">Gemini API Key</Label>
                            <Input
                                id="apiKey"
                                placeholder="AIzaSy..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                disabled={isPending}
                                type="password"
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-primary transition-colors"
                                >
                                    API Key 발급받기 (Google AI Studio)
                                </a>
                            </p>
                        </div>

                        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 bg-secondary/50 p-3 rounded-md">
                            <li>개인키는 안전하게 암호화되어 저장됩니다.</li>
                            <li>언제든지 설정 메뉴에서 변경할 수 있습니다.</li>
                            <li>Gemini Flash 모델은 무료로 충분히 사용 가능합니다.</li>
                        </ul>

                        <Button type="submit" className="w-full" disabled={isPending || !apiKey}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    설정 저장 중...
                                </>
                            ) : (
                                "시작하기"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
