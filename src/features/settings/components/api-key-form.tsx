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
    hasKey: boolean;
}

export function ApiKeyForm({ hasKey }: ApiKeyFormProps) {
    const [apiKey, setApiKey] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        if (!apiKey.trim()) {
            toast.error("API Key를 입력해주세요.");
            return;
        }

        startTransition(async () => {
            const result = await saveApiKey(apiKey);
            if (result.success) {
                toast.success("저장 완료", { description: result.message });
                setApiKey(""); // Clear input for security
            } else {
                toast.error("저장 실패", { description: result.message });
            }
        });
    };

    return (
        <Card className="w-full max-w-4xl shadow-sm border">
            <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    AI API Key 설정
                </CardTitle>
                <CardDescription>
                    Google Gemini API Key를 등록하여 나만의 AI를 사용하세요.
                    <br />
                    키는 서버에 안전하게 저장되며, 언제든지 변경할 수 있습니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="api-key">Gemini API Key</Label>
                    <div className="relative">
                        <Input
                            id="api-key"
                            type={isVisible ? "text" : "password"}
                            placeholder={hasKey ? "•••••••••••••••• (이미 등록됨)" : "AI Studio에서 발급받은 키를 입력하세요"} // Masked logic
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="pr-10"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setIsVisible(!isVisible)}
                            title={isVisible ? "숨기기" : "보기"}
                        >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {hasKey && (
                    <div className="flex items-center gap-2 p-2 px-3 bg-green-500/10 text-green-600 rounded-md text-sm border border-green-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                        <span>현재 유효한 API Key가 등록되어 있습니다. 새로운 키를 입력하면 덮어씌워집니다.</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
                <Button variant="outline" asChild>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        키 발급받기 ↗
                    </a>
                </Button>
                <Button onClick={handleSave} disabled={isPending || !apiKey}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {hasKey ? "API Key 변경하기" : "API Key 등록하기"}
                </Button>
            </CardFooter>
        </Card>
    );
}
