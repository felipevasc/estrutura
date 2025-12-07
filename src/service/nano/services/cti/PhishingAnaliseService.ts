import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { analisarHtmlPhishing } from "./phishingAnalise/avaliadorPhishing";
import { PhishingStatus } from "@prisma/client";
import { linhaComandoCti, saidaBrutaCti } from "./registroExecucaoCti";

type Payload = { id: number; args: unknown };

type Entrada = { dominioId?: number; alvo?: string; html?: string };

class PhishingAnaliseService extends NanoService {
    constructor() {
        super("PhishingAnaliseService");
    }

    async initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "phishing_analise_pagina") {
                this.executar(payload as Payload).catch((erro: unknown) => {
                    const mensagem = erro instanceof Error ? erro.message : "Erro nao tratado";
                    this.error(`Erro nao tratado em executar: ${mensagem}`, erro as Error);
                });
            }
        });
    }

    private async executar({ id, args }: Payload) {
        try {
            const bruto = typeof args === "string" ? JSON.parse(args) : args;
            const entrada = bruto as Entrada;
            const dominioId = Number(entrada?.dominioId);
            const alvo = String(entrada?.alvo || "").toLowerCase();
            if (!dominioId || !alvo) throw new Error("Dados obrigatorios");

            const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
            if (!dominio) throw new Error(`Dominio ${dominioId} nao encontrado`);

            const html = entrada.html || await this.baixarHtml(alvo);
            const avaliacao = analisarHtmlPhishing(html);

            if (!avaliacao.salvar) {
                const executedCommand = linhaComandoCti("phishing_analise_pagina", { dominioId, alvo });
                const rawOutput = saidaBrutaCti({ avaliacao, html });
                this.bus.emit("JOB_COMPLETED", { id, result: { status: "DESCARTADO", motivo: avaliacao.motivo, filtro: avaliacao.filtro }, executedCommand, rawOutput });
                return;
            }

            const termo = avaliacao.motivo || "analise_html";
            const dados = { alvo, termo, fonte: "analise_html", dominioId, status: avaliacao.status || PhishingStatus.NECESSARIO_ANALISE };
            const existente = await prisma.phishing.findFirst({ where: { alvo, dominioId } });
            const registro = existente
                ? await prisma.phishing.update({ where: { id: existente.id }, data: dados })
                : await prisma.phishing.create({ data: dados });

            const executedCommand = linhaComandoCti("phishing_analise_pagina", { dominioId, alvo });
            const rawOutput = saidaBrutaCti({ avaliacao, html, registroId: registro.id });
            this.bus.emit("JOB_COMPLETED", { id, result: { status: dados.status, registroId: registro.id }, executedCommand, rawOutput });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha na analise";
            this.bus.emit("JOB_FAILED", { id, error: mensagem });
        }
    }

    private async baixarHtml(alvo: string) {
        const urls = alvo.startsWith("http") ? [alvo] : [`https://${alvo}`, `http://${alvo}`];
        for (const url of urls) {
            try {
                const resposta = await fetch(url, { method: "GET", redirect: "follow" });
                if (!resposta.ok) continue;
                const conteudo = await resposta.text();
                if (conteudo) return conteudo;
            } catch {}
        }
        return "";
    }
}

export default PhishingAnaliseService;
