import { NextResponse } from 'next/server';
import aiService from '@/service/ai/AiService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, messages } = body;

        if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        if (!messages) return NextResponse.json({ error: 'Messages required' }, { status: 400 });

        const response = await aiService.generateResponse(projectId, messages);

        return NextResponse.json({ message: response });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
