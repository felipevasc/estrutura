import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { PortaResponse } from "@/types/PortaResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<PortaResponse[]> {
    const p = await params;
    const ret = await prisma.porta.findMany({
        where: {
            ip: {
                projetoId: Number(p.id),
            },
            servico: {
                not: null
            }
        },
        include: {
            whatwebResultados: true,
            ip: {
                include: {
                    usuarios: true,
                    dominios: true,
                    portas: true,
                    redes: true,
                    diretorios: true
                }
            }
        },
    });
    return NextResponse.json(ret);
}
