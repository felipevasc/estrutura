import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DominioResponse } from "@/types/DominioResponse";
import { NextRequest, NextResponse } from "next/server";

const includeIp = {
    include: {
        portas: true,
        dominios: true,
        redes: true,
        sambaUsers: true,
        sambaShares: true,
    }
};
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<DominioResponse[]> {
    const p = await params
    const ret = await prisma.dominio.findMany({
        where: {
            projetoId: Number(p.id),
            pai: null,
        },
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
    return NextResponse.json(ret);
}