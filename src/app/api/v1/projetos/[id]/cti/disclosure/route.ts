
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const vazamentos = await prisma.vazamentoInformacao.findMany({
            where: {
                dominio: {
                    projetoId: parseInt(id)
                }
            },
            include: {
                dominio: true
            },
            orderBy: {
                criadoEm: 'desc'
            }
        });

        return NextResponse.json(vazamentos);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        await prisma.vazamentoInformacao.deleteMany({
            where: {
                dominio: {
                    projetoId: parseInt(id)
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
