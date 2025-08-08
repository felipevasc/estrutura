import { NextResponse } from 'next/server';
import prisma from '@/database';
import CommandProcessor from '@/service/CommandProcessor';

export async function POST(request: Request) {
    try {
        const { command, args, projectId } = await request.json();

        if (!command || !args || !projectId) {
            return NextResponse.json({ message: 'Missing required fields: command, args, projectId' }, { status: 400 });
        }

        const newCommand = await prisma.command.create({
            data: {
                command,
                args: JSON.stringify(args),
                projectId,
            },
        });

        CommandProcessor.processQueue();

        return NextResponse.json({ message: 'Command added to the queue', command: newCommand }, { status: 202 });
    } catch (error) {
        console.error('[API /queue/add] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
