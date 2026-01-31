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
        <div className={cn("pb-12 h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link href="/" className="mb-6 flex items-center px-4 pl-6">
                        <div className="relative h-10 w-full max-w-[150px]">
                            <Image
                                src="/logo.png"
                                alt="ProInsight Logo"
                                width={150}
                                height={40}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.active ? "secondary" : "ghost"}
                                className="w-full justify-start"
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
