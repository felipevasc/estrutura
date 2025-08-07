import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idProjeto = searchParams.get('idProjeto');

    if (!idProjeto) {
        return NextResponse.json({ error: 'idProjeto is required' }, { status: 400 });
    }

    try {
        const redes = await prisma.rede.findMany({
            where: {
                projetoId: parseInt(idProjeto, 10),
            },
            include: {
                ips: true,
            },
        });
        return NextResponse.json(redes);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching redes' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { cidr, alias, projetoId } = body;

        if (!cidr || !projetoId) {
            return NextResponse.json({ error: 'cidr and projetoId are required' }, { status: 400 });
        }

        const newRede = await prisma.rede.create({
            data: {
                cidr,
                alias,
                projetoId,
            },
        });

        return NextResponse.json(newRede, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating rede' }, { status: 500 });
    }
}
