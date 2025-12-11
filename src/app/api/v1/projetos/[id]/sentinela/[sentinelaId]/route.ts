import prisma from "@/database";
import NanoSystem from "@/service/nano/System";
import { calcularProximaExecucao } from "@/service/sentinela/calcularProximaExecucao";
import { normalizarParametros } from "@/service/sentinela/normalizarParametros";
import { NextRequest, NextResponse } from "next/server";

const validarModulo = (valor: unknown) => valor === 'RECON' || valor === 'CTI';

const respostaErro = (mensagem: string, status = 400) => NextResponse.json({ mensagem }, { status });

export async function PATCH(request: NextRequest, { params }: { params: { id: string, sentinelaId: string } }) {
    const projetoId = Number(params.id);
    const id = Number(params.sentinelaId);
    if (!projetoId || !id) return respostaErro('Dados inválidos', 400);
    const existente = await prisma.sentinela.findUnique({ where: { id } });
    if (!existente || existente.projetoId !== projetoId) return respostaErro('Registro não encontrado', 404);
    const corpo = await request.json();
    if (corpo.modulo && !validarModulo(corpo.modulo)) return respostaErro('Módulo inválido', 422);
    const dados: Record<string, unknown> = {};
    if (corpo.nome !== undefined) dados.nome = corpo.nome;
    if (corpo.modulo !== undefined) dados.modulo = corpo.modulo;
    if (corpo.ferramenta !== undefined) dados.ferramenta = corpo.ferramenta;
    if (corpo.cron !== undefined) dados.cron = corpo.cron;
    if (corpo.habilitado !== undefined) dados.habilitado = corpo.habilitado;
    if (corpo.parametros !== undefined) dados.parametros = normalizarParametros(corpo.parametros);
    const habilitado = corpo.habilitado === undefined ? existente.habilitado : corpo.habilitado;
    const cron = corpo.cron ?? existente.cron;
    dados.proximaExecucao = habilitado ? calcularProximaExecucao(cron) : null;
    if (!habilitado) dados.ultimaExecucao = existente.ultimaExecucao;
    const registro = await prisma.sentinela.update({ where: { id }, data: dados });
    NanoSystem.process();
    return NextResponse.json({ registro });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string, sentinelaId: string } }) {
    const projetoId = Number(params.id);
    const id = Number(params.sentinelaId);
    if (!projetoId || !id) return respostaErro('Dados inválidos', 400);
    const existente = await prisma.sentinela.findUnique({ where: { id } });
    if (!existente || existente.projetoId !== projetoId) return respostaErro('Registro não encontrado', 404);
    await prisma.sentinela.delete({ where: { id } });
    return NextResponse.json({ mensagem: 'Registro removido' });
}
