import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Vercel Cron Job endpoint
export async function GET(request: Request) {
    // Optional: Add basic security header check if calling from external cron service
    // For Vercel Cron, they send an Authorization header that you can verify
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('🧹 [CRON] Starting Garbage Collection for stale posts...');
        
        // Target: Posts marked as 'PREPARING' that are older than 24 hours
        // This gives plenty of time (24h) for any legitimate generation process to finish
        // avoiding race conditions with slow AI generation.
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await prisma.post.deleteMany({
            where: {
                status: 'PREPARING',
                createdAt: {
                    lt: twentyFourHoursAgo,
                },
            },
        });

        console.log(`✅ [CRON] Cleanup complete. Deleted ${result.count} stale posts.`);
        
        return NextResponse.json({ 
            success: true, 
            message: `Deleted ${result.count} stale 'PREPARING' posts.` 
        });
    } catch (error) {
        console.error('❌ [CRON] Failed to run garbage collection:', error);
        return NextResponse.json({ error: 'Failed to run cleanup' }, { status: 500 });
    }
}
