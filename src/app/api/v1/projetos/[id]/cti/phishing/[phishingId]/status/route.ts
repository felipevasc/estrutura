import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";

export async function PATCH(request: NextRequest, { params }: { params: { id: string; phishingId: string } }) {
    try {
        const { id, phishingId } = await params;
        const body = await request.json();
        const { status } = body;

        const phishing = await prisma.phishing.update({
            where: { id: Number(phishingId) },
            data: { status }
        });

        return NextResponse.json(phishing);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
    }
}
