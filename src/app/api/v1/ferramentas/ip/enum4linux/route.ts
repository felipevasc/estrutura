import { queueCommand } from "@/service/nano/commandHelper";
import prisma from "@/database";
import { NextResponse } from "next/server";

export async function POST(requisicao: Request) {
  try {
    const corpo = await requisicao.json();
    const { ip, projetoId } = corpo;

    if (!ip) {
      return NextResponse.json(
        { mensagem: 'O campo "ip" é obrigatório no body.' },
        { status: 400 }
      );
    }

    const where: any = { endereco: ip };
    if (projetoId) where.projetoId = projetoId;

    const ipObj = await prisma.ip.findFirst({ where });

    if (!ipObj) {
        return NextResponse.json({ mensagem: 'IP não encontrado.' }, { status: 404 });
    }

    const command = await queueCommand('enum4linux', { idIp: ipObj.id }, ipObj.projetoId);

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
