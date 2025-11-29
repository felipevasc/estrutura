import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DiretorioResponse } from "@/types/DiretorioResponse";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { id: string } };

export async function GET(_: NextRequest, { params }: Params): ApiResponse<DiretorioResponse | null> {
    const id = Number(params.id);
    const diretorio = await prisma.diretorio.findUnique({
        where: { id },
        include: {
            dominio: { select: { id: true, endereco: true } },
            ip: { select: { id: true, endereco: true } },
        },
    });
    return NextResponse.json(diretorio);
}
