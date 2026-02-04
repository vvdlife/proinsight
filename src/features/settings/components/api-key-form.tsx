// Path: src/features/settings/components/api-key-form.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { saveApiKey } from "@/features/settings/actions/save-api-key";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Key } from "lucide-react";

interface ApiKeyFormProps {
    hasKey: {
        gemini: boolean;
        openai: boolean;
    };
}

export function ApiKeyForm({ hasKey }: ApiKeyFormProps) {
    return (
        <Card className="w-full max-w-4xl shadow-sm border">
            <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    AI API Key 설정
                </CardTitle>
                <CardDescription>
                    각 AI 서비스별 API Key를 안전하게 관리하세요.
                    <br />
                    키는 서버에 안전하게 저장되며, 언제든지 변경할 수 있습니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {/* Gemini Section */}
                <KeyInputSection
                    provider="gemini"
                    label="Google Gemini API Key"
                    hasKey={hasKey.gemini}
                    placeholder="AI Studio에서 발급받은 키 (AI-XXX)"
                    link="https://aistudio.google.com/app/apikey"
                />

                <div className="border-t" />

                {/* OpenAI Section */}
                <KeyInputSection
                    provider="openai"
                    label="OpenAI API Key"
                    hasKey={hasKey.openai}
                    placeholder="OpenAI Platform에서 발급받은 키 (sk-XXX)"
                    link="https://platform.openai.com/api-keys"
                />
            </CardContent>
        </Card>
    );
}

function KeyInputSection({ provider, label, hasKey, placeholder, link }: { provider: "gemini" | "openai", label: string, hasKey: boolean, placeholder: string, link: string }) {
    const [apiKey, setApiKey] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        if (!apiKey.trim()) {
            toast.error("API Key를 입력해주세요.");
            return;
        }

        startTransition(async () => {
            const result = await saveApiKey(apiKey, provider);
            if (result.success) {
                toast.success(`${label} 저장 완료`);
                setApiKey("");
            } else {
                toast.error("저장 실패", { description: result.message });
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor={`api-key-${provider}`} className="text-base font-medium">{label}</Label>
                <Button variant="link" size="sm" asChild className="h-auto p-0 text-muted-foreground">
                    <a href={link} target="_blank" rel="noopener noreferrer">키 발급받기 ↗</a>
                </Button>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        id={`api-key-${provider}`}
                        type={isVisible ? "text" : "password"}
                        placeholder={hasKey ? "•••••••••••••••• (저장됨)" : placeholder}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="pr-10 font-mono"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setIsVisible(!isVisible)}
                        type="button"
                    >
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <Button onClick={handleSave} disabled={isPending || !apiKey}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "저장"}
                </Button>
            </div>

            {hasKey && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>사용 가능 (저장됨)</span>
                </div>
            )}
        </div>
    );
}
