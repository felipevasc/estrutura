import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!id)
        return NextResponse.json({ error: "Id do IP é obrigatório" }, { status: 400 })

    const ret = await prisma.ip.findFirst({
        where: { id: Number(id) },
        include: {
            dominios: true,
            redes: true,
            portas: true,
            nmapScans: { orderBy: { createdAt: 'desc' } },
            whoisInfos: { orderBy: { createdAt: 'desc' } },
            dnsreconScans: { orderBy: { createdAt: 'desc' } },
            whatWebResults: { orderBy: { createdAt: 'desc' } },
            niktoScans: { orderBy: { createdAt: 'desc' } },
            feroxbusterScans: { orderBy: { createdAt: 'desc' } },
            testsslScans: { orderBy: { createdAt: 'desc' } },
            nucleiScans: { orderBy: { createdAt: 'desc' } },
            enum4linuxScans: { orderBy: { createdAt: 'desc' } },
            webScreenshots: { orderBy: { createdAt: 'desc' } },
        }
    });
    return NextResponse.json(ret);
}
