import { NextRequest, NextResponse } from "next/server";
import { queueCommand } from "@/service/nano/commandHelper";

const tiposValidos = ["dominio", "porta", "diretorio"] as const;
const abrangencias = ["subdominios", "diretorios", "portas"] as const;
type TipoAlvo = typeof tiposValidos[number];
type TipoAbrangencia = typeof abrangencias[number];

type AlvoPayload = { tipo?: TipoAlvo; id?: number };

type Payload = { alvos?: AlvoPayload[]; abrangencia?: TipoAbrangencia; dominioId?: number; ipId?: number; diretorioId?: number };

const numeroOuNulo = (valor?: number | string | null) => {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
};

const alvoValido = (alvo: AlvoPayload) => {
    const tipo = tiposValidos.find((item) => item === alvo.tipo) as TipoAlvo | undefined;
    const id = numeroOuNulo(alvo.id);
    return tipo && id ? { tipo, id } : null;
};

export async function POST(request: NextRequest, contexto: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await contexto.params;
        const projetoId = parseInt(id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const corpo = await request.json() as Payload;
        const alvos = Array.isArray(corpo.alvos) ? corpo.alvos.map(alvoValido).filter(Boolean) as { tipo: TipoAlvo; id: number }[] : [];
        const abrangencia = abrangencias.find((item) => item === corpo.abrangencia) as TipoAbrangencia | undefined;
        const dominioId = numeroOuNulo(corpo.dominioId);
        const ipId = numeroOuNulo(corpo.ipId);
        const diretorioId = numeroOuNulo(corpo.diretorioId);

        if (!alvos.length && !abrangencia) return NextResponse.json({ error: "Nenhum alvo informado" }, { status: 400 });

        await queueCommand("recon_capturar", { projetoId, alvos, abrangencia, dominioId, ipId, diretorioId }, projetoId);
        return NextResponse.json({ message: "Capturas enfileiradas." });
    } catch (erro) {
        console.error("Erro ao enfileirar capturas:", erro);
        return NextResponse.json({ error: "Erro interno ao enfileirar capturas." }, { status: 500 });
    }
}
