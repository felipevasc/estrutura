import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { IpResponse } from "@/types/IpResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): ApiResponse<IpResponse[]> {
    const ret = await prisma.ip.findMany({
        include: {
            dominios: true,
            redes: true,
            portas: true,
            usuarios: true,
            diretorios: true,
        }
    });
    return NextResponse.json(ret);
}

export async function POST(req: NextRequest): ApiResponse<IpResponse> {
    const data = await req.json();
    const ret = await prisma.ip.create({
        data,
        include: {
            dominios: true,
            redes: true,
            portas: true,
            usuarios: true,
            diretorios: true,
        }
    });
    return NextResponse.json(ret);
}
