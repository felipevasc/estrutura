import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";

const includeIp = {
    include: {
        portas: true
    }
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!id)
        return NextResponse.json({ error: "Id do dominio é obrigatório" }, { status: 400 })

    const ret = await prisma.dominio.findFirst({
        where: { id: Number(id) },
        include: {
            ips: includeIp,
            subDominios: {
                include: {
                    ips: includeIp,
                    subDominios: {
                        include: {
                            ips: includeIp,
                            subDominios: {
                                include: {
                                    ips: includeIp,
                                    subDominios: {
                                        include: {
                                            ips: includeIp,
                                            subDominios: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    console.log("AAAA", ret, "-------")
    return NextResponse.json(ret);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const body = await request.json();
    console.log(body);
    const { id } = await params
    if (!id)
        return NextResponse.json({ error: "Id do dominio é obrigatório" }, { status: 400 })
    if (!body.projetoId) {
        return NextResponse.json({ error: "Nome do projeto é obrigatório" }, { status: 400 });
    }
    const ret = await prisma.dominio.update({
        where: {
            id: Number(id)
        },
        data: {
            endereco: body.endereco,
            alias: body.alias,
            projetoId: body.projetoId,
        },
    });
    return NextResponse.json(ret);
}