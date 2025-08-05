import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DominioResponse } from "@/types/DominioResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<DominioResponse[]> {
    const p = await params
    const ret = await prisma.dominio.findMany({
        where: {
            projetoId: Number(p.id),
            pai: null
        }
    });
    return NextResponse.json(ret);
}