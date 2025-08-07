import { NextResponse } from 'next/server';
import prisma from '@/database';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idParam } = await params
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID de IP inválido.' }, { status: 400 });
    }

    try {
        const ipDetails = await prisma.ip.findUnique({
            where: { id },
            include: {
                portas: true,
                whois: true,
                traceroutes: { orderBy: { hop: 'asc' } },
                smbShares: true,
            }
        });

        if (!ipDetails) {
            return NextResponse.json({ error: 'IP não encontrado.' }, { status: 404 });
        }

        // Now, fetch relations of relations, which Prisma doesn't do in one go.
        const portaIds = ipDetails.portas.map(p => p.id);

        const vulnerabilidades = await prisma.vulnerabilidade.findMany({
            where: { portaId: { in: portaIds } },
            include: { porta: true }
        });

        const webAppPaths = await prisma.webAppPath.findMany({
            where: { portaId: { in: portaIds } },
            include: { porta: true }
        });

        const sslCiphers = await prisma.sSLCipher.findMany({
            where: { portaId: { in: portaIds } },
            include: { porta: true }
        });

        const exploits = await prisma.exploit.findMany({
            where: { portaId: { in: portaIds } },
            include: { porta: true }
        });

        const fullDetails = {
            ...ipDetails,
            vulnerabilidades,
            webAppPaths,
            sslCiphers,
            exploits
        };

        return NextResponse.json(fullDetails);
    } catch (error) {
        console.error(`[API /ips/details]`, error);
        return NextResponse.json({ error: 'Erro ao buscar detalhes do IP.' }, { status: 500 });
    }
}
