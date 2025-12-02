import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { gerarTermosPhishing } from "@/utils/geradorTermosPhishing";
import { Dominio } from "@prisma/client";
import { execFile } from "child_process";
import { promisify } from "util";
import { queueCommand } from "@/service/nano/commandHelper";

const executar = promisify(execFile);

type Payload = { id: number; args: unknown };

type Dados = { dominioId?: number; termo?: string };

class PhishingDnstwistService extends NanoService {
    constructor() {
        super("PhishingDnstwistService");
    }

    async initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "phishing_dnstwist_check" || payload.command === "phishing_dnstwist_termo") {
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
        if (!termos.length) throw new Error("Nenhum termo disponível");

        for (const termo of termos) {
            await queueCommand("phishing_dnstwist_termo", { dominioId, termo }, dominio.projetoId);
        }

        this.bus.emit("JOB_COMPLETED", { id, result: { termosEnfileirados: termos.length } });
    }

    private async executarTermo(id: number, dominioId: number, termo: string) {
        const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
        if (!dominio) throw new Error(`Domínio ${dominioId} não encontrado`);

        const alvos = await this.executarDnstwist(termo);
        const criados: any[] = [];

        for (const alvoBruto of alvos) {
            const alvo = alvoBruto.toLowerCase();
            const existente = await prisma.phishing.findFirst({ where: { alvo, dominioId } });
            if (!existente) {
                const criado = await prisma.phishing.create({ data: { alvo, termo, fonte: "dnstwist", dominioId } });
                criados.push(criado);
            }
        }

        this.bus.emit("JOB_COMPLETED", { id, result: criados });
    }

    private async obterTermos(dominio: Dominio) {
        const existentes = await prisma.termoPhishing.findMany({ where: { dominioId: dominio.id }, orderBy: { termo: "asc" } });
        if (existentes.length) return existentes.map(item => item.termo);

        const gerados = gerarTermosPhishing(dominio.endereco);
        if (!gerados.length) return [] as string[];

        const criados = await prisma.$transaction(gerados.map(termo => prisma.termoPhishing.create({ data: { termo, dominioId: dominio.id } })));
        return criados.map(item => item.termo);
    }

    private async executarDnstwist(termo: string) {
        try {
            const { stdout, stderr } = await executar("dnstwist", ["--registered", "--format", "json", termo], { maxBuffer: 15 * 1024 * 1024 });
            this.log(`Saida dnstwist para ${termo}: ${stdout}`);
            if (stderr) this.log(`Saida de erro dnstwist para ${termo}: ${stderr}`);
            const resultado = JSON.parse(stdout || "[]");
            if (!Array.isArray(resultado)) return [] as string[];

            const hosts = resultado.map((entrada: Record<string, unknown>) => {
                const alvo = String(entrada["domain-name"] || entrada.domain || entrada.host || "").toLowerCase();
                const registros = [
                    ...(Array.isArray(entrada["dns-a"]) ? entrada["dns-a"] : []),
                    ...(Array.isArray(entrada["dns-aaaa"]) ? entrada["dns-aaaa"] : []),
                    ...(Array.isArray(entrada["dns-mx"]) ? entrada["dns-mx"] : [])
                ];
                return registros.length > 0 ? alvo : "";
            }).filter(Boolean);

            return Array.from(new Set(hosts));
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "erro inesperado";
            const detalhes = erro as { stdout?: string; stderr?: string };
            if (detalhes.stdout) this.error(`Saida dnstwist com falha: ${detalhes.stdout}`);
            if (detalhes.stderr) this.error(`Erro dnstwist com falha: ${detalhes.stderr}`);
            this.error(`Falha na execução do dnstwist: ${mensagem}`);
            return [] as string[];
        }
    }
}

export default PhishingDnstwistService;
