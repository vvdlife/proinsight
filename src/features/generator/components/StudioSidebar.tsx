"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, Search, FileText, PenTool, Save, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

export type StudioStep = "IDLE" | "SEARCHING" | "PLANNING" | "WRITING" | "SAVING" | "COMPLETED";

interface StudioSidebarProps {
    status: StudioStep;
    progress: number;
    logs: string[];
    className?: string;
}

const STEPS = [
    { id: "SEARCHING", label: "Deep Research", icon: Search },
    { id: "PLANNING", label: "Outline & Strategy", icon: FileText },
    { id: "WRITING", label: "Drafting Content", icon: PenTool },
    { id: "SAVING", label: "Final Polish", icon: Save },
];

export function StudioSidebar({ status, progress, logs, className }: StudioSidebarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getStepStatus = (stepId: string) => {
        const stepIndex = STEPS.findIndex(s => s.id === stepId);
        const currentIndex = STEPS.findIndex(s => s.id === status);
        
        if (status === "COMPLETED") return "completed";
        if (status === "IDLE") return "pending";

        if (currentIndex > stepIndex) return "completed";
        if (currentIndex === stepIndex) return "active";
        return "pending";
    };

    return (
        <div className={cn("flex flex-col h-full bg-muted/30 border-r", className)}>
            {/* 1. Header */}
            <div className="p-6 border-b bg-background/50 backdrop-blur-sm">
                <h2 className="text-lg font-semibold tracking-tight mb-1 flex items-center gap-2">
                    <Loader2 className={cn("h-4 w-4 text-primary", status !== "COMPLETED" && "animate-spin")} />
                    AI Creation Studio
                </h2>
                <p className="text-xs text-muted-foreground">
                    Agent is orchestrating your content...
                </p>
                
                {/* Global Progress */}
                <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* 2. Steps Indicator */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-1">
                    {STEPS.map((step, index) => {
                        const stepStatus = getStepStatus(step.id);
                        const Icon = step.icon;
                        
                        return (
                            <div key={step.id} className="relative pl-8 py-2">
                                {/* Vertical Line */}
                                {index !== STEPS.length - 1 && (
                                    <div className={cn(
                                        "absolute left-[11px] top-8 bottom-[-16px] w-[2px]",
                                        stepStatus === "completed" ? "bg-primary" : "bg-muted"
                                    )} />
                                )}

                                {/* Dot / Icon */}
                                <div className={cn(
                                    "absolute left-0 top-2.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                    stepStatus === "completed" ? "bg-primary border-primary text-primary-foreground" :
                                    stepStatus === "active" ? "bg-background border-primary text-primary animate-pulse" :
                                    "bg-background border-muted text-muted-foreground"
                                )}>
                                    {stepStatus === "completed" ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Icon className="h-3 w-3" />
                                    )}
                                </div>

                                {/* Label */}
                                <div>
                                    <p className={cn(
                                        "text-sm font-medium transition-colors duration-300",
                                        stepStatus === "active" ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </p>
                                    {stepStatus === "active" && (
                                        <p className="text-xs text-primary mt-0.5 animate-in fade-in slide-in-from-left-2">
                                            Working...
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Live Logs (Terminal) */}
            <div className="p-4 border-t bg-black/5 dark:bg-black/20">
                <div className="text-xs font-mono text-muted-foreground mb-2 flex items-center justify-between">
                    <span>TERMINAL OUTPUT</span>
                    <span className="opacity-50">v1.0.2</span>
                </div>
                <div 
                    ref={scrollRef}
                    className="h-32 overflow-y-auto font-mono text-[10px] space-y-1 p-2 rounded-md bg-background border shadow-inner"
                >
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2 text-foreground/80 break-all">
                            <span className="text-muted-foreground shrink-0">{`>`}</span>
                            <span>{log}</span>
                        </div>
                    ))}
                    {logs.length === 0 && <span className="opacity-50 italic">Waiting for process start...</span>}
                    <div className="h-2" /> {/* Spacer */}
                </div>
            </div>
        </div>
    );
}
