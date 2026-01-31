"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Home, PenTool, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DashboardSidebar({ className }: DashboardSidebarProps) {
    const pathname = usePathname();

    const routes = [
        {
            label: "Dashboard",
            icon: Home,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "새 글 작성",
            icon: PenTool,
            href: "/dashboard/new",
            active: pathname === "/dashboard/new",
        },
        {
            label: "작성 기록",
            icon: FileText,
            href: "/dashboard/posts",
            active: pathname.startsWith("/dashboard/posts"),
        },
        {
            label: "설정",
            icon: Settings,
            href: "/dashboard/settings",
            active: pathname === "/dashboard/settings",
        },
    ];

    return (
        <div className={cn("pb-12 h-screen border-r border-[#333] bg-[#121212] text-zinc-300", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link href="/" className="mb-8 flex justify-center px-4">
                        <div className="relative h-9 w-full max-w-[100px]">
                            <Image
                                src="/logo.png"
                                alt="ProInsight Logo"
                                width={150}
                                height={150}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start hover:bg-zinc-800 hover:text-white mb-1",
                                    route.active ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400" : "text-zinc-400"
                                )}
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon className="mr-2 h-4 w-4" />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
