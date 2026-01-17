"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyGate } from "@/features/auth/actions/verify-gate";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";

export default function GatePage() {
    const [password, setPassword] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await verifyGate(password);
            if (result.success) {
                toast.success("환영합니다!", { description: "입장이 허용되었습니다." });
                router.refresh(); // Update cookies in client context
                router.push("/dashboard");
            } else {
                toast.error("입장 불가", { description: result.message });
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">ProInsight Access Gate</CardTitle>
                        <CardDescription className="pt-2">
                            이 서비스는 비공개로 운영됩니다.<br />
                            관리자가 발급한 접근 코드를 입력해주세요.
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isPending || !password}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    확인 중...
                                </>
                            ) : (
                                "입장하기"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
