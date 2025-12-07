import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { mkdir, readdir, rename, rm, writeFile, access, copyFile } from "fs/promises";
import { linhaComandoCti, saidaBrutaCti } from "./registroExecucaoCti";

const executar = promisify(execFile);

type Payload = { id: number; args: unknown };

type Args = { projetoId?: number; ids?: number[]; dominioId?: number };

type Registro = { id: number; url: string };

class DefaceCapturaService extends NanoService {
    private ferramenta = process.env.GOWITNESS_BIN || "gowitness";

    constructor() {
        super("DefaceCapturaService");
    }

    initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "deface_capturar") {
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

            const registros = await prisma.deface.findMany({ where: filtros, select: { id: true, url: true } });
            if (!registros.length) throw new Error("Nenhum alvo para captura");

            const pasta = await this.obterPastaCapturas();
            let capturados = 0;
            const comandos: string[] = [];
            const saidas: string[] = [];
            for (const registro of registros) {
                const resultado = await this.processarRegistro(registro, pasta);
                if (resultado?.comando) comandos.push(resultado.comando);
                if (resultado?.saida) saidas.push(resultado.saida);
                if (resultado?.caminho) capturados += 1;
            }

            const executedCommand = comandos.length ? comandos.join(" | ") : linhaComandoCti(this.ferramenta);
            const rawOutput = saidaBrutaCti(saidas.join("\n"));
            this.bus.emit("JOB_COMPLETED", { id, result: { capturados, total: registros.length }, executedCommand, rawOutput });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha na captura";
            this.bus.emit("JOB_FAILED", { id, error: mensagem });
        }
    }

    private async processarRegistro(registro: Registro, pasta: string) {
        const url = this.normalizarUrl(registro.url);
        if (!url) return null;
        const resultado = await this.capturar(registro.id, url, pasta);
        if (!resultado.caminho) return null;
        await prisma.deface.update({ where: { id: registro.id }, data: { captura: resultado.caminho, capturadoEm: new Date() } });
        return resultado;
    }

    private normalizarUrl(url: string) {
        const alvo = String(url || "").trim();
        if (!alvo) return "";
        if (alvo.startsWith("http://") || alvo.startsWith("https://")) return alvo;
        return `http://${alvo}`;
    }

    private async capturar(id: number, url: string, pasta: string) {
        const modeloVazio = await this.obterCapturaVazia(pasta);
        const destinoCaptura = path.join(pasta, `${id}`);
        const comando = linhaComandoCti(this.ferramenta, ["scan", "single", "--url", url, "--screenshot-path", destinoCaptura]);
        try {
            await rm(destinoCaptura, { recursive: true, force: true });
            await mkdir(destinoCaptura, { recursive: true });
            const { stdout, stderr } = await executar(this.ferramenta, ["scan", "single", "--url", url, "--screenshot-path", destinoCaptura], { maxBuffer: 20 * 1024 * 1024 });
            const arquivos = await readdir(destinoCaptura);
            const candidatos = arquivos.filter((item) => {
                const extensao = path.extname(item).toLowerCase();
                return [".png", ".jpg", ".jpeg", ".webp"].includes(extensao);
            });
            const arquivo = candidatos[0] || arquivos[0];
            const saida = saidaBrutaCti([stdout, stderr].filter(Boolean).join("\n"));
            if (!arquivo) return { caminho: await this.aplicarCapturaVazia(id, pasta, modeloVazio, destinoCaptura), comando, saida } as { caminho: string; comando: string; saida: string };
            const extensao = path.extname(arquivo) || ".png";
            const destinoFinal = path.join(pasta, `${id}${extensao}`);
            await rm(destinoFinal, { force: true });
            await rename(path.join(destinoCaptura, arquivo), destinoFinal);
            await rm(destinoCaptura, { recursive: true, force: true });
            return { caminho: this.caminhoRelativo(id, extensao), comando, saida } as { caminho: string; comando: string; saida: string };
        } catch (erro: unknown) {
            const codigo = (erro as NodeJS.ErrnoException).code;
            const mensagem = codigo === "ENOENT" ? "Ferramenta gowitness não encontrada" : `Erro ao capturar ${url}`;
            this.error(mensagem, erro as Error);
            await rm(destinoCaptura, { recursive: true, force: true });
            const caminho = await this.aplicarCapturaVazia(id, pasta, modeloVazio, destinoCaptura);
            const saida = erro instanceof Error ? erro.message : String(erro || "");
            return { caminho, comando, saida };
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
        const pasta = path.join(process.cwd(), "public", "deface", "capturas");
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
        return `/deface/capturas/${id}${extensao}`;
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

export default DefaceCapturaService;
