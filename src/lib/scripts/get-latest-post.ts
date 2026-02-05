
import { prisma } from "../db";

async function main() {
    const post = await prisma.post.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, topic: true }
    });
    console.log(post ? JSON.stringify(post) : "No posts found");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
