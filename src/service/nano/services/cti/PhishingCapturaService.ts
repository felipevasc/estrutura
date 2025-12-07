import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { mkdir, rm } from "fs/promises";

const executar = promisify(execFile);

type Payload = { id: number; args: unknown };

type Args = { projetoId?: number; ids?: number[]; dominioId?: number };

type Registro = { id: number; alvo: string };

class PhishingCapturaService extends NanoService {
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
                const sucesso = await this.processarRegistro(registro, pasta);
                if (sucesso) capturados += 1;
            }

            this.bus.emit("JOB_COMPLETED", { id, result: { capturados, total: registros.length } });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha na captura";
            this.bus.emit("JOB_FAILED", { id, error: mensagem });
        }
    }

    private async processarRegistro(registro: Registro, pasta: string) {
        const destino = path.join(pasta, `${registro.id}.png`);
        const url = this.normalizarUrl(registro.alvo);
        const sucesso = await this.capturar(url, destino);
        if (!sucesso) return false;
        await prisma.phishing.update({ where: { id: registro.id }, data: { captura: this.caminhoRelativo(registro.id), capturadoEm: new Date() } });
        return true;
    }

    private normalizarUrl(alvo: string) {
        const host = alvo.replace(/^https?:\/\//, "").split("/")[0];
        return `http://${host}`;
    }

    private async capturar(url: string, destino: string) {
        try {
            await rm(destino, { force: true });
            await executar("gowitness", ["single", "--url", url, "--screenshot-path", destino], { maxBuffer: 20 * 1024 * 1024 });
            return true;
        } catch (erro: unknown) {
            this.error(`Erro ao capturar ${url}`, erro as Error);
            return false;
        }
    }

    private async obterPastaCapturas() {
        const pasta = path.join(process.cwd(), "public", "phishing", "capturas");
        await mkdir(pasta, { recursive: true });
        return pasta;
    }

    private caminhoRelativo(id: number) {
        return `/phishing/capturas/${id}.png`;
    }
}

export default PhishingCapturaService;
