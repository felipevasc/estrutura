import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { Dominio } from "@prisma/client";
import { queueCommand } from "@/service/nano/commandHelper";
import { carregarBasePhishing } from "@/utils/basePhishing";

type Payload = { id: number; args: unknown };

type Dados = { dominioId?: number; termo?: string };

class PhishingCrtshService extends NanoService {
    constructor() {
        super("PhishingCrtshService");
    }

    async initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "phishing_crtsh_check" || payload.command === "phishing_crtsh_termo") {
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
            const dados = dadosBrutos as Dados;
            const dominioId = dados?.dominioId;
            if (!dominioId) throw new Error("dominioId é obrigatório");

            if (dados.termo) {
                await this.executarTermo(id, dominioId, dados.termo);
                return;
            }

            await this.enfileirarTermos(id, dominioId);
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha desconhecida";
            this.bus.emit("JOB_FAILED", { id, error: mensagem });
        }
    }

    private async enfileirarTermos(id: number, dominioId: number) {
        const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
        if (!dominio) throw new Error(`Domínio ${dominioId} não encontrado`);

        const termos = await this.obterTermos(dominio);
        if (!termos.length) throw new Error("Nenhuma palavra disponível");

        for (const termo of termos) {
            await queueCommand("phishing_crtsh_termo", { dominioId, termo }, dominio.projetoId);
        }

        this.bus.emit("JOB_COMPLETED", { id, result: { termosEnfileirados: termos.length } });
    }

    private async executarTermo(id: number, dominioId: number, termo: string) {
        const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
        if (!dominio) throw new Error(`Domínio ${dominioId} não encontrado`);

        const alvos = await this.buscarCrtsh(termo);
        const criados: any[] = [];

        for (const alvo of alvos) {
            const existente = await prisma.phishing.findFirst({ where: { alvo, dominioId } });
            if (!existente) {
                const criado = await prisma.phishing.create({ data: { alvo, termo, fonte: "crtsh", dominioId } });
                criados.push(criado);
            }
        }

        this.bus.emit("JOB_COMPLETED", { id, result: criados });
    }

    private async obterTermos(dominio: Dominio) {
        const base = await carregarBasePhishing(dominio);
        return base.palavras;
    }

    private async buscarCrtsh(termo: string) {
        try {
            const url = `https://crt.sh/?q=%25${encodeURIComponent(termo)}%25&output=json`;
            const resposta = await fetch(url, { headers: { Accept: "application/json" } });
            if (!resposta.ok) {
                this.error(`Falha ao consultar crt.sh para ${termo}: ${resposta.statusText}`);
                return [] as string[];
            }

            const dados = await resposta.json().catch(() => [] as unknown[]);
            if (!Array.isArray(dados)) return [] as string[];

            const alvos = dados.flatMap((entrada: Record<string, unknown>) => {
                const bruto = String(entrada["name_value"] || "").toLowerCase();
                return bruto.split(/\r?\n/).map(item => item.replace(/^\*\./, "").trim()).filter(Boolean);
            });

            return Array.from(new Set(alvos));
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "erro inesperado";
            this.error(`Erro na busca do crt.sh: ${mensagem}`);
            return [] as string[];
        }
    }
}

export default PhishingCrtshService;
