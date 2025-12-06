import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { PhishingStatus } from "@prisma/client";
import { execFile } from "child_process";
import { promisify } from "util";
import { queueCommand } from "@/service/nano/commandHelper";
import { carregarBasePhishing } from "@/utils/basePhishing";
import { gerarCombinacoesPhishing } from "@/utils/geradorTermosPhishing";
import { alvoAcessivel } from "@/utils/conectividade";
import { access } from "fs/promises";
import { constants } from "fs";

const executar = promisify(execFile);

type Payload = { id: number; args: unknown };

type Dados = { dominioId?: number; termo?: string };

class PhishingDnstwistService extends NanoService {
    private dnstwistDisponivel: boolean | null = null;
    private dnstwistBinario = "dnstwist";

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

            const pronto = await this.verificarDnstwist();
            if (!pronto) {
                this.bus.emit("JOB_FAILED", { id, error: "dnstwist não está disponível" });
                return;
            }

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

        const base = await carregarBasePhishing(dominio);
        const palavras = gerarCombinacoesPhishing(base.palavras);
        const termos = this.combinar(palavras, base.tlds);
        if (!termos.length) throw new Error("Nenhuma combinação disponível");

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
            const disponivel = await alvoAcessivel(alvo);
            if (!disponivel) continue;
            const existente = await prisma.phishing.findFirst({ where: { alvo, dominioId } });
            if (!existente) {
                const criado = await prisma.phishing.create({ data: { alvo, termo, fonte: "dnstwist", dominioId, status: PhishingStatus.NECESSARIO_ANALISE } });
                criados.push(criado);
            }
        }

        this.bus.emit("JOB_COMPLETED", { id, result: criados });
    }

    private combinar(palavras: string[], tlds: string[]) {
        const alvos = new Set<string>();
        for (const palavra of palavras) {
            const tronco = palavra.toLowerCase().replace(/^\./, "").replace(/\.+$/, "");
            if (!tronco) continue;
            for (const tld of tlds) {
                const final = tld.toLowerCase().replace(/^\./, "");
                if (final) alvos.add(`${tronco}.${final}`);
            }
        }
        return Array.from(alvos);
    }

    private async executarDnstwist(termo: string) {
        try {
            const { stdout, stderr } = await executar(this.dnstwistBinario, ["--registered", "--format", "json", termo], { maxBuffer: 15 * 1024 * 1024 });
            this.log(`Saida dnstwist para ${termo}: ${stdout}`);
            if (stderr) this.log(`Saida de erro dnstwist para ${termo}: ${stderr}`);
            const resultado = JSON.parse(stdout || "[]");
            if (!Array.isArray(resultado)) return [] as string[];

            const hosts = resultado.map((entrada: Record<string, unknown>) => {
                const alvo = String(entrada["domain-name"] || entrada.domain || entrada.host || "").toLowerCase();
                const coletar = (chaves: string[]) => chaves.flatMap(chave => Array.isArray(entrada[chave]) ? entrada[chave] : []);
                const registros = [
                    ...coletar(["dns-a", "dns_a"]),
                    ...coletar(["dns-aaaa", "dns_aaaa"]),
                    ...coletar(["dns-mx", "dns_mx"])
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

    private async verificarDnstwist() {
        if (this.dnstwistDisponivel !== null) return this.dnstwistDisponivel;
        const caminho = await this.localizarDnstwist();
        if (!caminho) {
            this.error("dnstwist não encontrado no PATH");
            this.dnstwistDisponivel = false;
            return false;
        }
        this.dnstwistBinario = caminho;
        this.dnstwistDisponivel = true;
        return true;
    }

    private async localizarDnstwist() {
        const caminhos = (process.env.PATH || "").split(":").filter(Boolean);
        for (const base of caminhos) {
            const candidato = `${base}/dnstwist`;
            try {
                await access(candidato, constants.X_OK);
                return candidato;
            } catch (_) {}
        }
        return "";
    }
}

export default PhishingDnstwistService;
