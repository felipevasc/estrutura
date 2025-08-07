import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { IpResponse } from "@/types/IpResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<IpResponse[]> {
    const p = await params
    const ret = await prisma.ip.findMany({
        where: {
            projetoId: Number(p.id),
        }
    });
    return NextResponse.json(ret);
}