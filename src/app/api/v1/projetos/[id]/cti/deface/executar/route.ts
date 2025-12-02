import { NextRequest, NextResponse } from "next/server";
import { queueCommand } from "@/service/nano/commandHelper";

interface ExecutePayload {
    dominioId: number;
    ferramenta: string;
    grupo: string;
    paginas?: number;
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
        const { dominioId, ferramenta, grupo, paginas } = body;

        if (!dominioId || !ferramenta || !grupo) {
            return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
        }
        if (grupo === 'dorks') {
            const commandName = 'deface_dork_check';
            const args = { dominioId, category: ferramenta };
            await queueCommand(commandName, args, projetoId);
            return NextResponse.json({ message: `Comando '${commandName}' (Categoria: ${ferramenta}) enfileirado com sucesso.` });
        }

        if (grupo === 'foruns' && ferramenta === 'zone-xsec') {
            const commandName = 'deface_forum_zone_xsec_check';
            const totalPaginas = paginas && paginas > 0 ? paginas : 10;
            const args = { dominioId, paginas: totalPaginas };
            await queueCommand(commandName, args, projetoId);
            return NextResponse.json({ message: `Comando '${commandName}' (Ferramenta: ${ferramenta}) enfileirado com sucesso.` });
        }

        if (grupo === 'foruns' && ferramenta === 'hack-db') {
            const commandName = 'deface_forum_hack_db_check';
            const totalPaginas = paginas && paginas > 0 ? paginas : 10;
            const args = { dominioId, paginas: totalPaginas };
            await queueCommand(commandName, args, projetoId);
            return NextResponse.json({ message: `Comando '${commandName}' (Ferramenta: ${ferramenta}) enfileirado com sucesso.` });
        }

        return NextResponse.json({ error: "Ferramenta inválida" }, { status: 400 });

    } catch (error) {
        console.error("Erro ao enfileirar comando de deface:", error);
        return NextResponse.json(
            { error: "Ocorreu um erro no servidor ao enfileirar o comando." },
            { status: 500 }
        );
    }
}
