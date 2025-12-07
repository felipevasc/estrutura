import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { mkdir, readdir, rename, rm, writeFile, access, copyFile } from "fs/promises";

const executar = promisify(execFile);

type Payload = { id: number; args: unknown };

type Args = { projetoId?: number; ids?: number[]; dominioId?: number };

type Registro = { id: number; alvo: string };

class PhishingCapturaService extends NanoService {
    private ferramenta = process.env.GOWITNESS_BIN || "gowitness";

    constructor() {
        super("PhishingCapturaService");
    }

    initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "phishing_capturar") {
                this.executar(payload as Payload).catch((erro: unknown) => {
                    const mensagem = erro instanceof Error ? erro.message : "Erro não tratado";
                    this.error(`Erro não tratado em executar: ${mensagem}`, erro as Error);
                });
            }
        });
    }

    private async executar({ id, args }: Payload) {
        try {
            const dadosBrutos = typeof args === "string" ? JSON.parse(args) : args;
            const dados = dadosBrutos as Args;
            const projetoId = Number(dados?.projetoId);
            if (!projetoId) throw new Error("Projeto inválido");

            const disponivel = await this.validarFerramenta();
            if (!disponivel) throw new Error("Ferramenta gowitness indisponível");

            const ids = Array.isArray(dados?.ids) ? dados.ids.map((item) => Number(item)).filter((item) => !isNaN(item)) : [];
            const dominioId = Number(dados?.dominioId) || null;
            const filtros = { dominio: { projetoId } } as { dominio: { projetoId: number }; id?: { in: number[] }; dominioId?: number };
            if (ids.length) filtros.id = { in: ids };
            if (dominioId) filtros.dominioId = dominioId;

            const registros = await prisma.phishing.findMany({ where: filtros, select: { id: true, alvo: true } });
            if (!registros.length) throw new Error("Nenhum alvo para captura");

            const pasta = await this.obterPastaCapturas();
            let capturados = 0;
            for (const registro of registros) {
                const caminho = await this.processarRegistro(registro, pasta);
                if (caminho) capturados += 1;
            }

            this.bus.emit("JOB_COMPLETED", { id, result: { capturados, total: registros.length } });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha na captura";
            this.bus.emit("JOB_FAILED", { id, error: mensagem });
        }
    }

    private async processarRegistro(registro: Registro, pasta: string) {
        const url = this.normalizarUrl(registro.alvo);
        const caminho = await this.capturar(registro.id, url, pasta);
        if (!caminho) return null;
        await prisma.phishing.update({ where: { id: registro.id }, data: { captura: caminho, capturadoEm: new Date() } });
        return caminho;
    }

    private normalizarUrl(alvo: string) {
        const host = alvo.replace(/^https?:\/\//, "").split("/")[0];
        return `http://${host}`;
    }

    private async capturar(id: number, url: string, pasta: string) {
        const modeloVazio = await this.obterCapturaVazia(pasta);
        const destinoCaptura = path.join(pasta, `${id}`);
        try {
            await rm(destinoCaptura, { recursive: true, force: true });
            await mkdir(destinoCaptura, { recursive: true });
            await executar(this.ferramenta, ["scan", "single", "--url", url, "--screenshot-path", destinoCaptura], { maxBuffer: 20 * 1024 * 1024 });
            const arquivos = await readdir(destinoCaptura);
            const candidatos = arquivos.filter((item) => {
                const extensao = path.extname(item).toLowerCase();
                return [".png", ".jpg", ".jpeg", ".webp"].includes(extensao);
            });
            const arquivo = candidatos[0] || arquivos[0];
            if (!arquivo) return await this.aplicarCapturaVazia(id, pasta, modeloVazio, destinoCaptura);
            const extensao = path.extname(arquivo) || ".png";
            const destinoFinal = path.join(pasta, `${id}${extensao}`);
            await rm(destinoFinal, { force: true });
            await rename(path.join(destinoCaptura, arquivo), destinoFinal);
            await rm(destinoCaptura, { recursive: true, force: true });
            return this.caminhoRelativo(id, extensao);
        } catch (erro: unknown) {
            const codigo = (erro as NodeJS.ErrnoException).code;
            const mensagem = codigo === "ENOENT" ? "Ferramenta gowitness não encontrada" : `Erro ao capturar ${url}`;
            this.error(mensagem, erro as Error);
            await rm(destinoCaptura, { recursive: true, force: true });
            return await this.aplicarCapturaVazia(id, pasta, modeloVazio, destinoCaptura);
        }
    }

    private async aplicarCapturaVazia(id: number, pasta: string, modelo: string, temporario: string) {
        await rm(temporario, { recursive: true, force: true });
        const destinoFinal = path.join(pasta, `${id}.png`);
        await rm(destinoFinal, { force: true });
        await copyFile(modelo, destinoFinal);
        return this.caminhoRelativo(id, ".png");
    }

    private async obterPastaCapturas() {
        const pasta = path.join(process.cwd(), "public", "phishing", "capturas");
        await mkdir(pasta, { recursive: true });
        return pasta;
    }

    private async obterCapturaVazia(pasta: string) {
        const destino = path.join(pasta, "vazio.png");
        try {
            await access(destino);
            return destino;
        } catch {}
        const conteudo = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAGgwJ/lN9T4QAAAABJRU5ErkJggg==", "base64");
        await writeFile(destino, conteudo);
        return destino;
    }

    private caminhoRelativo(id: number, extensao: string) {
        return `/phishing/capturas/${id}${extensao}`;
    }

    private async validarFerramenta() {
        try {
            await executar(this.ferramenta, ["version"], { timeout: 5000 });
            return true;
        } catch (erro: unknown) {
            const codigo = (erro as NodeJS.ErrnoException).code;
            const mensagem = codigo === "ENOENT" ? "Ferramenta gowitness não encontrada" : "Falha ao executar gowitness";
            this.error(mensagem, erro as Error);
            return false;
        }
    }
}

export default PhishingCapturaService;
