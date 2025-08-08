import { executarNmap } from "@/service/tools/ip/nmap";
import { NextResponse } from "next/server";

export async function POST(requisicao: Request) {
  try {
    const corpo = await requisicao.json();
    const { ip } = corpo;

    if (!ip) {
      return NextResponse.json(
        { mensagem: 'O campo "ip" é obrigatório no body.' },
        { status: 400 }
      );
    }
    
    const subdominios = await executarNmap(ip);
    

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