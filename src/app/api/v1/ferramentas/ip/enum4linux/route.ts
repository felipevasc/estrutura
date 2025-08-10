import { NextResponse } from "next/server";
import prisma from "@/database";
import CommandProcessor from "@/service/CommandProcessor";

export async function POST(requisicao: Request) {
  try {
    const corpo = await requisicao.json();
    const { idIp } = corpo;

    if (!idIp) {
      return NextResponse.json(
        { mensagem: 'O campo "idIp" é obrigatório no body.' },
        { status: 400 }
      );
    }

    const ip = await prisma.ip.findFirst({ where: { id: Number(idIp) }});
    if (!ip) {
      return NextResponse.json(
        { mensagem: 'IP não encontrado.' },
        { status: 404 }
      );
    }

    await prisma.command.create({
        data: {
            command: "enum4linux",
            args: JSON.stringify({ idIp }),
            projectId: ip.projetoId,
        },
    });

    CommandProcessor.processQueue();

    return NextResponse.json(
      { message: "Comando enum4linux adicionado à fila." },
      { status: 202 }
    );

  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido.';
    console.error('[API Handler] Erro ao processar requisição:', mensagemErro);
    return NextResponse.json({ mensagem: 'Erro interno no servidor.' }, { status: 500 });
  }
}
