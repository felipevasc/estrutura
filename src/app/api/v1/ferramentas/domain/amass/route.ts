import { iniciarEnumeracaoAmass } from "@/service/tools/domain/amass";
import { NextResponse } from "next/server";

export async function POST(requisicao: Request) {
  try {
    const corpo = await requisicao.json();
    const { dominio } = corpo;

    if (!dominio) {
      return NextResponse.json(
        { mensagem: 'O campo "dominio" é obrigatório no body.' },
        { status: 400 }
      );
    }
    
    const subdominios = await iniciarEnumeracaoAmass(dominio);
    

    return NextResponse.json(
      subdominios,
      { status: 202 }
    );

  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido.';
    console.error('[API Handler] Erro ao processar requisição:', mensagemErro);
    return NextResponse.json({ mensagem: 'Erro interno no servidor.' }, { status: 500 });
  }
}