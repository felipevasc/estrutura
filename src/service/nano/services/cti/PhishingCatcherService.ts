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
import { gerarTermosPhishing } from "@/utils/geradorTermosPhishing";
import { linhaComandoCti, saidaBrutaCti } from "./registroExecucaoCti";

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

            const base = await carregarBasePhishing(dominio);
            const configuracao = await this.carregarConfiguracao(dominio, base);
            const { alvos, comando, saida } = await this.executarFerramenta(dominio, configuracao);
            await this.registrarResultados(dominio.id, configuracao, alvos);

            const executedCommand = comando || linhaComandoCti("phishing_catcher", { dominio: dominio.endereco });
            const rawOutput = saidaBrutaCti(saida || alvos);
            this.bus.emit("JOB_COMPLETED", { id, result: { encontrados: alvos.length }, executedCommand, rawOutput });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha desconhecida";
            this.bus.emit("JOB_FAILED", { id, error: mensagem });
        }
    }

    private async carregarConfiguracao(dominio: Dominio, base: { palavrasChave: string[]; palavrasAuxiliares: string[]; tlds: string[] }) {
        const existente = await prisma.configuracaoPhishingCatcher.findUnique({ where: { dominioId: dominio.id } });
        const termosBase = gerarTermosPhishing(base.palavrasChave, base.palavrasAuxiliares);
        if (existente) return this.sincronizarComBase(this.normalizarConfiguracao(existente.palavras as PalavraChave[], existente.tlds as string[]), termosBase, base.tlds);

        const padrao = await this.configuracaoPadrao(termosBase, base.tlds);
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

    private async configuracaoPadrao(termos: string[], tlds: string[]) {
        const palavras = Array.from(new Set(termos)).map(termo => ({ termo: termo.toLowerCase(), peso: 3 }));
        return { palavras, tlds } as Configuracao;
    }

    private sincronizarComBase(configuracao: Configuracao, termos: string[], tldsBase: string[]) {
        const permitidos = new Set(termos.map(item => item.toLowerCase()));
        const lista = configuracao.palavras.filter(item => permitidos.has(item.termo.toLowerCase()));
        const existentes = new Set(lista.map(item => item.termo));
        permitidos.forEach(termo => { if (!existentes.has(termo)) lista.push({ termo, peso: 3 }); });
        const tlds = configuracao.tlds.length ? configuracao.tlds : tldsBase;
        return { palavras: lista, tlds } as Configuracao;
    }

    private async executarFerramenta(dominio: Dominio, configuracao: Configuracao) {
        const caminho = await this.gerarArquivoConfiguracao(dominio.id, configuracao);
        const comando = linhaComandoCti("phishing_catcher", ["--config", caminho, "--dominio", dominio.endereco]);
        try {
            const { stdout, stderr } = await executar("phishing_catcher", ["--config", caminho, "--dominio", dominio.endereco], { maxBuffer: 15 * 1024 * 1024 });
            if (stderr) this.log(`Saida de erro phishing_catcher para ${dominio.endereco}: ${stderr}`);
            const alvos = this.extrairAlvos(stdout, configuracao);
            const saida = saidaBrutaCti([stdout, stderr].filter(Boolean).join("\n"));
            return { alvos, comando, saida } as { alvos: { alvo: string; termo: string }[]; comando: string; saida: string };
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "erro inesperado";
            const detalhes = erro as { stdout?: string; stderr?: string };
            if (detalhes.stdout) this.error(`Saida phishing_catcher com falha: ${detalhes.stdout}`);
            if (detalhes.stderr) this.error(`Erro phishing_catcher com falha: ${detalhes.stderr}`);
            this.error(`Falha na execução do phishing_catcher: ${mensagem}`);
            const saida = saidaBrutaCti([detalhes.stdout, detalhes.stderr, mensagem].filter(Boolean).join("\n"));
            return { alvos: [] as { alvo: string; termo: string }[], comando, saida };
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
