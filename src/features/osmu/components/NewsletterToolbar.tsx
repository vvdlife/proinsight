// Path: src/features/osmu/components/NewsletterToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NewsletterToolbar() {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const handleCopyHtml = () => {
        const content = document.getElementById("newsletter-content");
        if (!content) return;

        // Clone and get outerHTML
        // In a real scenario, we might want to inline CSS styles here using a library like juice
        // For now, we rely on the inline styles we wrote in the page.tsx
        const html = content.outerHTML;

        navigator.clipboard.writeText(html).then(() => {
            setCopied(true);
            toast.success("이메일 HTML이 복사되었습니다.");
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-50 flex items-center justify-between px-6 shadow-sm print:hidden">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
            </Button>

            <span className="font-semibold text-sm hidden md:block">
                뉴스레터 미리보기 (600px width)
            </span>

            <Button onClick={handleCopyHtml} variant={copied ? "default" : "outline"} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "복사됨" : "HTML 복사"}
            </Button>
        </div>
    );
}
