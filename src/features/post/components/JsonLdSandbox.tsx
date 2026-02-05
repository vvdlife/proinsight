"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface JsonLdSandboxProps {
    schemaMarkup: string | null;
}

export function JsonLdSandbox({ schemaMarkup }: JsonLdSandboxProps) {
    const [copied, setCopied] = useState(false);

    if (!schemaMarkup) {
        return (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                <p>생성된 스키마 마크업이 없습니다.</p>
                <p className="text-xs mt-1">글을 저장하거나 SEO 분석을 실행하면 생성됩니다.</p>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(schemaMarkup);
        setCopied(true);
        toast.success("JSON-LD 코드가 복사되었습니다.");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleValidate = () => {
        // Encode the snippet to pass to Google's testing tool (Limit: code snippets via URL usually tricky, so we link to the tool)
        // Actually, Google Rich Results Test prefers URL or Code input manually. We will link to the tool and copy to clipboard.
        navigator.clipboard.writeText(schemaMarkup);
        toast.info("코드가 복사되었습니다. Google 도구에 붙여넣어 검증하세요.");
        window.open("https://search.google.com/test/rich-results", "_blank");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">JSON-LD 구조화 데이터</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        복사
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleValidate}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Google 검증
                    </Button>
                </div>
            </div>

            <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border max-h-[300px]">
                <code>{JSON.stringify(JSON.parse(schemaMarkup), null, 2)}</code>
            </pre>

            <p className="text-xs text-muted-foreground">
                이 코드는 <code>&lt;head&gt;</code> 태그 내에 삽입되어 검색 엔진이 콘텐츠를 더 잘 이해하도록 돕습니다.
            </p>
        </div>
    );
}
