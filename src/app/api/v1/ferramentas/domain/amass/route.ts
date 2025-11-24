import { queueCommand } from "@/service/nano/commandHelper";
import prisma from "@/database";
import { NextResponse } from "next/server";

export async function POST(requisicao: Request) {
  try {
    const corpo = await requisicao.json();
    const { dominio, projetoId } = corpo;

    if (!dominio) {
      return NextResponse.json(
        { mensagem: 'O campo "dominio" é obrigatório no body.' },
        { status: 400 }
      );
    }
    
    // Find the domain
    // If projetoId is provided, use it. Otherwise try to find any.
    const where: any = { endereco: dominio };
    if (projetoId) where.projetoId = projetoId;

    const dom = await prisma.dominio.findFirst({ where });

    if (!dom) {
        return NextResponse.json({ mensagem: 'Domínio não encontrado.' }, { status: 404 });
    }

    const command = await queueCommand('amass', { idDominio: dom.id }, dom.projetoId);

    return NextResponse.json(
      { message: "Scan started", commandId: command.id },
      { status: 202 }
    );

  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido.';
    console.error('[API Handler] Erro ao processar requisição:', mensagemErro);
    return NextResponse.json({ mensagem: 'Erro interno no servidor.' }, { status: 500 });
  }
}
