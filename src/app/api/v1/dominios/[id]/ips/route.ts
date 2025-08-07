import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!id)
        return NextResponse.json({ error: "Id do dominio é obrigatório" }, { status: 400 })

    const ret = await prisma.ip.findMany({
        where: {
            dominios: {
                some: {
                    id: Number(id)
                }
            }
        }
    });
    return NextResponse.json(ret);
}
