import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";

export async function GET(
    request: NextRequest,
    contexto: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await contexto.params;
        const projetoId = parseInt(id, 10);

        if (isNaN(projetoId)) {
            return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });
        }

        const defaceResults = await prisma.deface.findMany({
            where: {
                dominio: {
                    projetoId: projetoId,
                },
            },
            include: {
                dominio: {
                    select: {
                        endereco: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(defaceResults);

    } catch (error) {
        console.error("Erro ao buscar resultados de deface:", error);
        return NextResponse.json(
            { error: "Ocorreu um erro no servidor ao buscar os dados." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    contexto: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await contexto.params;
        const projetoId = parseInt(id, 10);

        if (isNaN(projetoId)) {
            return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });
        }

        await prisma.deface.deleteMany({
            where: {
                dominio: {
                    projetoId: projetoId,
                },
            },
        });

        return NextResponse.json({ message: "Dados de deface limpos com sucesso." }, { status: 200 });

    } catch (error) {
        console.error("Erro ao limpar dados de deface:", error);
        return NextResponse.json(
            { error: "Ocorreu um erro no servidor ao limpar os dados." },
            { status: 500 }
        );
    }
}
