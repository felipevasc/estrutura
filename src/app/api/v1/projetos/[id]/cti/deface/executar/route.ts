import { NextRequest, NextResponse } from "next/server";
import { queueCommand } from "@/service/nano/commandHelper";

interface ExecutePayload {
    dominioId: number;
    ferramenta: 'hackedby' | 'pwnedby';
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resolvedParams = await params;
        const projetoId = parseInt(resolvedParams.id, 10);

        if (isNaN(projetoId)) {
            return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });
        }

        const body = await request.json() as ExecutePayload;
        const { dominioId, ferramenta } = body;

        if (!dominioId || !ferramenta) {
            return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
        }

        let commandName = '';
        switch (ferramenta) {
            case 'hackedby':
                commandName = 'hackedby_check';
                break;
            case 'pwnedby':
                commandName = 'pwnedby_check';
                break;
            default:
                return NextResponse.json({ error: "Ferramenta desconhecida" }, { status: 400 });
        }

        const args = { dominioId };

        await queueCommand(commandName, args, projetoId);

        return NextResponse.json({ message: `Comando '${commandName}' enfileirado com sucesso.` });

    } catch (error) {
        console.error("Erro ao enfileirar comando de deface:", error);
        return NextResponse.json(
            { error: "Ocorreu um erro no servidor ao enfileirar o comando." },
            { status: 500 }
        );
    }
}
