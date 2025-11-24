import { NextResponse } from 'next/server';
import commandInterpreter from '@/service/ai/CommandInterpreter';
import prisma from '@/database';
import NanoSystem from '@/service/nano/System';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, command } = body;

        if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        if (!command) return NextResponse.json({ error: 'Command required' }, { status: 400 });

        const job = await commandInterpreter.interpret(command, projectId);

        const newCommand = await prisma.command.create({
            data: {
                command: job.command,
                args: job.args,
                projectId: job.projectId,
                status: 'PENDING'
            }
        });

        // Trigger NanoSystem processing
        NanoSystem.process();

        return NextResponse.json({ success: true, commandId: newCommand.id });
    } catch (error: any) {
        console.error('Execute API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
