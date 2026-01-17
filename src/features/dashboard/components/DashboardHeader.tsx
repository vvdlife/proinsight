// Path: src/features/dashboard/components/DashboardHeader.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 sm:max-w-xs">
                    <DashboardSidebar className="h-full border-r-0" />
                </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-4">
                    <UserButton showName />
                </div>
            </div>
        </header>
    );
}
