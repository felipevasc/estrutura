import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<UsuarioResponse[]> {
    const p = await params;
    const ret = await prisma.usuario.findMany({
        where: {
            ip: {
                projetoId: Number(p.id),
            },
        },
        include: {
            ip: true,
        },
    });
    return NextResponse.json(ret);
}
