import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir, mkdtemp } from "fs/promises";
import path from "path";
import { Dominio, PhishingStatus } from "@prisma/client";
import { carregarBasePhishing } from "@/utils/basePhishing";
import { tmpdir } from "os";
import { alvoAcessivel } from "@/utils/conectividade";

const executar = promisify(execFile);

type Payload = { id: number; args: unknown };

type Dados = { dominioId?: number };

type PalavraChave = { termo: string; peso: number };

type Configuracao = { palavras: PalavraChave[]; tlds: string[] };

class PhishingCatcherService extends NanoService {
    constructor() {
        super("PhishingCatcherService");
    }

    async initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "phishing_catcher_check") {
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

            const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
            if (!dominio) throw new Error(`Domínio ${dominioId} não encontrado`);

            const configuracao = await this.carregarConfiguracao(dominio);
            const alvos = await this.executarFerramenta(dominio, configuracao);
            await this.registrarResultados(dominio.id, configuracao, alvos);

            this.bus.emit("JOB_COMPLETED", { id, result: { encontrados: alvos.length } });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha desconhecida";
            this.bus.emit("JOB_FAILED", { id, error: mensagem });
        }
    }

    private async carregarConfiguracao(dominio: Dominio) {
        const existente = await prisma.configuracaoPhishingCatcher.findUnique({ where: { dominioId: dominio.id } });
        if (existente) return this.normalizarConfiguracao(existente.palavras as PalavraChave[], existente.tlds as string[]);

        const padrao = await this.configuracaoPadrao(dominio);
        await prisma.configuracaoPhishingCatcher.create({ data: { dominioId: dominio.id, palavras: padrao.palavras, tlds: padrao.tlds } });
        return padrao;
    }

    private normalizarConfiguracao(palavras: PalavraChave[], tlds: string[]) {
        const listaPalavras = (palavras || []).map(item => ({ termo: item.termo.toLowerCase().trim(), peso: Math.max(1, Number(item.peso) || 1) })).filter(item => item.termo);
        const unicas = new Map<string, PalavraChave>();
        for (const item of listaPalavras) unicas.set(item.termo, item);
        const listaTlds = Array.from(new Set((tlds || []).map(tld => tld.toLowerCase().replace(/^\./, "")).filter(Boolean)));
        return { palavras: Array.from(unicas.values()), tlds: listaTlds } as Configuracao;
    }

    private async configuracaoPadrao(dominio: Dominio) {
        const base = await carregarBasePhishing(dominio);
        const palavras = Array.from(new Set(base.palavras)).map(termo => ({ termo: termo.toLowerCase(), peso: 3 }));
        return { palavras, tlds: base.tlds } as Configuracao;
    }

    private async executarFerramenta(dominio: Dominio, configuracao: Configuracao) {
        const caminho = await this.gerarArquivoConfiguracao(dominio.id, configuracao);
        try {
            const { stdout, stderr } = await executar("phishing_catcher", ["--config", caminho, "--dominio", dominio.endereco], { maxBuffer: 15 * 1024 * 1024 });
            if (stderr) this.log(`Saida de erro phishing_catcher para ${dominio.endereco}: ${stderr}`);
            return this.extrairAlvos(stdout, configuracao);
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "erro inesperado";
            const detalhes = erro as { stdout?: string; stderr?: string };
            if (detalhes.stdout) this.error(`Saida phishing_catcher com falha: ${detalhes.stdout}`);
            if (detalhes.stderr) this.error(`Erro phishing_catcher com falha: ${detalhes.stderr}`);
            this.error(`Falha na execução do phishing_catcher: ${mensagem}`);
            return [] as { alvo: string; termo: string }[];
        }
    }

    private async obterPastaConfiguracao() {
        const candidatas = [path.join(process.cwd(), "tmp_phishing_catcher"), path.join(process.cwd(), "tmp", "phishing_catcher")];
        for (const pasta of candidatas) {
            try {
                await mkdir(pasta, { recursive: true });
                return pasta;
            } catch {}
        }
        return mkdtemp(path.join(tmpdir(), "phishing_catcher_"));
    }

    private async gerarArquivoConfiguracao(dominioId: number, configuracao: Configuracao) {
        const pasta = await this.obterPastaConfiguracao();
        const arquivo = path.join(pasta, `${dominioId}.json`);
        const conteudo = {
            keywords: configuracao.palavras.map(item => ({ palavra: item.termo, peso: item.peso })),
            tlds: configuracao.tlds
        };
        await writeFile(arquivo, JSON.stringify(conteudo, null, 2));
        return arquivo;
    }

    private extrairAlvos(saida: string, configuracao: Configuracao) {
        const linhas = (saida || "").split(/\r?\n/).map(linha => linha.trim()).filter(Boolean);
        const termoPadrao = configuracao.palavras[0]?.termo || "phishing_catcher";
        const registros: { alvo: string; termo: string }[] = [];

        for (const linha of linhas) {
            let alvo = "";
            let termo = termoPadrao;
            try {
                const dado = JSON.parse(linha) as Record<string, unknown>;
                alvo = String(dado["domain"] || dado["alvo"] || dado["host"] || "").toLowerCase();
                termo = String(dado["keyword"] || dado["termo"] || dado["palavra"] || termoPadrao);
            } catch {
                alvo = linha.toLowerCase();
            }
            if (alvo) registros.push({ alvo, termo });
        }

        const unicos = new Map<string, { alvo: string; termo: string }>();
        for (const item of registros) unicos.set(item.alvo, item);
        return Array.from(unicos.values());
    }

    private async registrarResultados(dominioId: number, configuracao: Configuracao, alvos: { alvo: string; termo: string }[]) {
        const criados: any[] = [];
        for (const entrada of alvos) {
            const alvo = entrada.alvo;
            const termo = entrada.termo || configuracao.palavras[0]?.termo || "phishing_catcher";
            const disponivel = await alvoAcessivel(alvo);
            if (!disponivel) continue;
            const existente = await prisma.phishing.findFirst({ where: { alvo, dominioId } });
            if (!existente) {
                const criado = await prisma.phishing.create({ data: { alvo, termo, fonte: "phishing_catcher", dominioId, status: PhishingStatus.NECESSARIO_ANALISE } });
                criados.push(criado);
            }
        }
        return criados;
    }
}

export default PhishingCatcherService;
