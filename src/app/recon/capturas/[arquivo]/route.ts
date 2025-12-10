import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

const tipos = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" } as Record<string, string>;

const arquivoSeguro = (nome: string) => path.basename(nome);

const caminhoPasta = () => path.join(process.cwd(), "public", "recon", "capturas");

const lerArquivo = async (caminho: string, pasta: string) => {
    try { return await readFile(caminho); } catch {}
    try { return await readFile(path.join(pasta, "vazio.png")); } catch {}
    return null;
};

export async function GET(_: NextRequest, contexto: { params: Promise<{ arquivo: string }> }) {
    const { arquivo } = await contexto.params;
    const nome = arquivoSeguro(arquivo);
    const pasta = caminhoPasta();
    const destino = path.join(pasta, nome);
    const conteudo = await lerArquivo(destino, pasta);
    if (!conteudo) return NextResponse.json({ error: "Captura não encontrada" }, { status: 404 });
    const tipo = tipos[path.extname(nome).toLowerCase()] || "image/png";
    return new NextResponse(conteudo, { status: 200, headers: { "content-type": tipo } });
}
