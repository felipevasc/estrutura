import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const gifsDirectory = path.join(process.cwd(), 'public', 'weaver', 'gifs');

        if (!fs.existsSync(gifsDirectory)) {
            return NextResponse.json({ gifs: [] });
        }

        const files = await fs.promises.readdir(gifsDirectory);
        const gifs = files
            .filter(file => file.toLowerCase().endsWith('.gif'))
            .map(file => `/weaver/gifs/${file}`);

        return NextResponse.json({ gifs });
    } catch (error) {
        console.error('Error listing GIFs:', error);
        return NextResponse.json({ gifs: [] }, { status: 500 });
    }
}
