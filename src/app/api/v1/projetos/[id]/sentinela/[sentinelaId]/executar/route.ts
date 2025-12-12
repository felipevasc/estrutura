import prisma from "@/database";
import { queueCommand } from "@/service/nano/commandHelper";
import { calcularProximaExecucao } from "@/service/sentinela/calcularProximaExecucao";
import { NextRequest, NextResponse } from "next/server";

const respostaErro = (mensagem: string, status = 400) => NextResponse.json({ mensagem }, { status });

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string, sentinelaId: string }> }) {
    const { id: projeto, sentinelaId } = await params;
    const projetoId = Number(projeto);
    const id = Number(sentinelaId);
    if (!projetoId || !id) return respostaErro('Dados inválidos', 400);
    const registro = await prisma.sentinela.findUnique({ where: { id } });
    if (!registro || registro.projetoId !== projetoId) return respostaErro('Registro não encontrado', 404);
    await queueCommand(registro.ferramenta, registro.parametros, projetoId);
    const agora = new Date();
    const proximaExecucao = registro.habilitado ? calcularProximaExecucao(registro.cron) : null;
    const atualizado = await prisma.sentinela.update({ where: { id }, data: { ultimaExecucao: agora, proximaExecucao } });
    return NextResponse.json({ registro: atualizado });
}
