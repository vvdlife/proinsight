// Path: src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    // 1. Access Gate Check
    // If accessing protected routes, check for 'site-access' cookie first
    if (isProtectedRoute(req)) {
        const hasAccess = req.cookies.get("site-access")?.value === "true";
        if (!hasAccess) {
            const gateUrl = new URL("/gate", req.url);
            return NextResponse.redirect(gateUrl);
        }

        // 2. Clerk Auth Check (If access granted)
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};


