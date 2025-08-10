import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { IpResponse } from "@/types/IpResponse";
import { NextResponse } from "next/server";

export async function GET(): ApiResponse<IpResponse[]> {
    const ret = await prisma.ip.findMany({
        include: {
            dominios: true,
            redes: true,
            portas: true,
            usuarios: true,
        },
    });
    return NextResponse.json(ret);
}

export async function POST(request: Request): ApiResponse<IpResponse> {
    const body = await request.json();
    console.log(body);
    if (!body.projetoId) {
        return NextResponse.json({ error: "ID do projeto é obrigatório" }, { status: 400 });
    }
    if (!body.endereco) {
        return NextResponse.json({ error: "Endereceo é obrigatório" }, { status: 400 });
    }

    const createdIp = await prisma.ip.create({
        data: {
            endereco: body.endereco,
            projetoId: body.projetoId,
        },
    });

    const ret = await prisma.ip.findUnique({
        where: {
            id: createdIp.id,
        },
        include: {
            dominios: true,
            redes: true,
            portas: true,
            usuarios: true,
        }
    });

    if (!ret) {
        return NextResponse.json({ error: "Falha ao buscar o IP recém-criado." }, { status: 500 });
    }

    return NextResponse.json(ret);
}