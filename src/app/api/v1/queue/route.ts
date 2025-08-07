import { NextResponse } from 'next/server';
import prisma from '@/database';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    try {
        const commands = await prisma.command.findMany({
            where: {
                ...(projectId && { projectId: Number(projectId) }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(commands, { status: 200 });
    } catch (error) {
        console.error('[API /queue] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
