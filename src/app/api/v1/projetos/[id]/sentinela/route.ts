import prisma from "@/database";
import NanoSystem from "@/service/nano/System";
import { calcularProximaExecucao } from "@/service/sentinela/calcularProximaExecucao";
import { normalizarParametros } from "@/service/sentinela/normalizarParametros";
import { NextRequest, NextResponse } from "next/server";

const validarModulo = (valor: unknown) => valor === 'RECON' || valor === 'CTI';

const respostaErro = (mensagem: string, status = 400) => NextResponse.json({ mensagem }, { status });

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projetoId = Number(id);
    if (!projetoId) return respostaErro('Projeto inválido', 400);
    const registros = await prisma.sentinela.findMany({ where: { projetoId }, orderBy: { criadoEm: 'desc' } });
    NanoSystem.process();
    return NextResponse.json({ registros });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projetoId = Number(id);
    if (!projetoId) return respostaErro('Projeto inválido', 400);
    const corpo = await request.json();
    const { nome, modulo, ferramenta, parametros, cron, habilitado } = corpo;
    if (!nome || !ferramenta || !cron || !validarModulo(modulo)) return respostaErro('Preencha todos os campos obrigatórios', 422);
    const parametrosNormalizados = normalizarParametros(parametros);
    const proximaExecucao = habilitado === false ? null : calcularProximaExecucao(cron);
    if (habilitado !== false && !proximaExecucao) return respostaErro('Cron inválido', 422);
    const registro = await prisma.sentinela.create({
        data: {
            nome,
            modulo,
            ferramenta,
            parametros: parametrosNormalizados,
            cron,
            habilitado: habilitado ?? true,
            proximaExecucao,
            projetoId,
        },
    });
    NanoSystem.process();
    return NextResponse.json({ registro }, { status: 201 });
}
