import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { access, copyFile, mkdir, readdir, rename, rm, writeFile } from "fs/promises";
import { NanoEvents } from "../../events";
import { resolverAlvo } from "./resolvedorAlvo";

const executar = promisify(execFile);

type Payload = { id: number; args: unknown };

type TipoAlvo = "dominio" | "porta" | "diretorio";

type Args = { projetoId?: number; alvos?: { tipo?: TipoAlvo; id?: number }[]; abrangencia?: "subdominios" | "diretorios" | "portas"; dominioId?: number | null; ipId?: number | null; diretorioId?: number | null };

type AlvoCaptura = { tipo: TipoAlvo; id: number; url: string };

type ResultadoCaptura = { caminho: string; comando: string; saida: string };

class ReconCapturaService extends NanoService {
    private ferramenta = process.env.GOWITNESS_BIN || "gowitness";

    constructor() {
        super("ReconCapturaService");
    }

    initialize() {
        this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
            if (payload.command === "recon_capturar") this.executar(payload as Payload).catch((erro) => this.error("Erro na captura de recon", erro as Error));
        });
    }

    private async executar({ id, args }: Payload) {
        try {
            const bruto = typeof args === "string" ? JSON.parse(args) : args;
            const dados = bruto as Args;
            const projetoId = Number(dados?.projetoId);
            if (!projetoId) throw new Error("Projeto inválido");

            const disponivel = await this.validarFerramenta();
            if (!disponivel) throw new Error("Ferramenta gowitness indisponível");

            const alvos = await this.obterAlvos(dados, projetoId);
            if (!alvos.length) throw new Error("Nenhum alvo para captura");

            const pasta = await this.obterPastaCapturas();
            let capturados = 0;
            const comandos: string[] = [];
            const saidas: string[] = [];

            for (const alvo of alvos) {
                const resultado = await this.processar(alvo, pasta);
                if (resultado?.comando) comandos.push(resultado.comando);
                if (resultado?.saida) saidas.push(resultado.saida);
                if (resultado?.caminho) capturados += 1;
            }

            const executedCommand = comandos.length ? comandos.join(" | ") : `${this.ferramenta} scan single`;
            const rawOutput = saidas.join("\n");
            this.bus.emit(NanoEvents.JOB_COMPLETED, { id, result: { capturados, total: alvos.length }, executedCommand, rawOutput });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : "Falha na captura";
            this.bus.emit(NanoEvents.JOB_FAILED, { id, error: mensagem });
        }
    }

    private async obterAlvos(dados: Args, projetoId: number) {
        const alvos: AlvoCaptura[] = [];
        const diretos = Array.isArray(dados.alvos) ? dados.alvos : [];
        for (const alvo of diretos) {
            const resolvido = await this.resolverIndividual(alvo, projetoId);
            if (resolvido) alvos.push(resolvido);
        }

        if (dados.abrangencia === "subdominios" && dados.dominioId) {
            const ids = await this.coletarSubdominios(projetoId, dados.dominioId);
            for (const alvoId of ids) {
                const resolvido = await this.resolverIndividual({ tipo: "dominio", id: alvoId }, projetoId);
                if (resolvido) alvos.push(resolvido);
            }
        }

        if (dados.abrangencia === "diretorios") {
            const ids = await this.coletarDiretorios(projetoId, dados);
            for (const alvoId of ids) {
                const resolvido = await this.resolverIndividual({ tipo: "diretorio", id: alvoId }, projetoId);
                if (resolvido) alvos.push(resolvido);
            }
        }

        if (dados.abrangencia === "portas" && dados.ipId) {
            const ids = await this.coletarPortas(projetoId, dados.ipId);
            for (const alvoId of ids) {
                const resolvido = await this.resolverIndividual({ tipo: "porta", id: alvoId }, projetoId);
                if (resolvido) alvos.push(resolvido);
            }
        }

        const vistos = new Set<string>();
        return alvos.filter((alvo) => {
            const chave = `${alvo.tipo}-${alvo.id}`;
            if (vistos.has(chave)) return false;
            vistos.add(chave);
            return true;
        });
    }

    private async resolverIndividual(alvo: { tipo?: TipoAlvo; id?: number }, projetoId: number) {
        const tipo = alvo.tipo;
        const id = Number(alvo.id);
        if (!tipo || !Number.isFinite(id)) return null;

        if (tipo === "dominio") {
            const dominio = await prisma.dominio.findFirst({ where: { id, projetoId } });
            if (!dominio) return null;
            const resolvido = await resolverAlvo({ idDominio: id });
            return { tipo, id, url: resolvido.alvo } as AlvoCaptura;
        }

        if (tipo === "porta") {
            const porta = await prisma.porta.findFirst({ where: { id, ip: { projetoId } }, include: { ip: true } });
            if (!porta) return null;
            const resolvido = await resolverAlvo({ idPorta: id });
            return { tipo, id, url: resolvido.alvo } as AlvoCaptura;
        }

        const diretorio = await prisma.diretorio.findFirst({ where: { id, OR: [{ dominio: { projetoId } }, { ip: { projetoId } }] } });
        if (!diretorio) return null;
        const resolvido = await resolverAlvo({ idDiretorio: id, idDominio: diretorio.dominioId ?? undefined, idIp: diretorio.ipId ?? undefined });
        return { tipo: "diretorio", id, url: resolvido.alvo } as AlvoCaptura;
    }

    private async coletarSubdominios(projetoId: number, dominioId: number) {
        const fila = [dominioId];
        const ids: number[] = [];
        while (fila.length) {
            const atual = fila.shift() as number;
            const filhos = await prisma.dominio.findMany({ where: { paiId: atual, projetoId }, select: { id: true } });
            filhos.forEach((filho) => {
                ids.push(filho.id);
                fila.push(filho.id);
            });
        }
        return ids;
    }

    private async coletarDiretorios(projetoId: number, dados: Args) {
        const diretorioId = Number(dados.diretorioId);
        const dominioId = Number(dados.dominioId);
        const ipId = Number(dados.ipId);
        const filtros = [] as { dominioId?: number; ipId?: number; prefixo?: string }[];

        if (Number.isFinite(diretorioId)) {
            const diretorio = await prisma.diretorio.findFirst({ where: { id: diretorioId, OR: [{ dominio: { projetoId } }, { ip: { projetoId } }] } });
            if (diretorio) filtros.push({ dominioId: diretorio.dominioId ?? undefined, ipId: diretorio.ipId ?? undefined, prefixo: diretorio.caminho });
        }

        if (Number.isFinite(dominioId)) filtros.push({ dominioId });
        if (Number.isFinite(ipId)) filtros.push({ ipId });

        if (!filtros.length) return [];

        const ids: number[] = [];
        for (const filtro of filtros) {
            const condicoes = [] as any[];
            if (filtro.dominioId) condicoes.push({ dominioId: filtro.dominioId });
            if (filtro.ipId) condicoes.push({ ipId: filtro.ipId });
            const where = condicoes.length ? { OR: condicoes } : { OR: [{ dominio: { projetoId } }, { ip: { projetoId } }] };
            const consulta = filtro.prefixo ? { ...where, caminho: { startsWith: filtro.prefixo } } : where;
            const diretorios = await prisma.diretorio.findMany({ where: consulta, select: { id: true } });
            diretorios.forEach((dir) => ids.push(dir.id));
        }

        return ids;
    }

    private async coletarPortas(projetoId: number, ipId: number) {
        const ipValido = await prisma.ip.findFirst({ where: { id: ipId, projetoId } });
        if (!ipValido) return [];
        const portas = await prisma.porta.findMany({ where: { ipId }, select: { id: true } });
        return portas.map((porta) => porta.id);
    }

    private async processar(alvo: AlvoCaptura, pasta: string) {
        const resultado = await this.capturar(alvo, pasta);
        if (!resultado?.caminho) return resultado;
        await this.salvar(alvo, resultado.caminho);
        return resultado;
    }

    private async capturar(alvo: AlvoCaptura, pasta: string): Promise<ResultadoCaptura | null> {
        const modelo = await this.obterCapturaVazia(pasta);
        const destino = path.join(pasta, `${alvo.tipo}-${alvo.id}`);
        const comando = `${this.ferramenta} scan single --url ${alvo.url} --screenshot-path ${destino}`;
        try {
            await rm(destino, { recursive: true, force: true });
            await mkdir(destino, { recursive: true });
            const { stdout, stderr } = await executar(this.ferramenta, ["scan", "single", "--url", alvo.url, "--screenshot-path", destino], { maxBuffer: 20 * 1024 * 1024 });
            const arquivos = await readdir(destino);
            const candidatos = arquivos.filter((item) => [".png", ".jpg", ".jpeg", ".webp"].includes(path.extname(item).toLowerCase()));
            const arquivo = candidatos[0] || arquivos[0];
            const saida = [stdout, stderr].filter(Boolean).join("\n");
            if (!arquivo) return { caminho: await this.aplicarVazio(alvo, pasta, modelo, destino), comando, saida };
            const extensao = path.extname(arquivo) || ".png";
            const destinoFinal = path.join(pasta, `${alvo.tipo}-${alvo.id}${extensao}`);
            await rm(destinoFinal, { force: true });
            await rename(path.join(destino, arquivo), destinoFinal);
            await rm(destino, { recursive: true, force: true });
            return { caminho: this.caminhoRelativo(alvo, extensao), comando, saida };
        } catch (erro: unknown) {
            await rm(destino, { recursive: true, force: true });
            const saida = erro instanceof Error ? erro.message : String(erro || "");
            return { caminho: await this.aplicarVazio(alvo, pasta, modelo, destino), comando, saida };
        }
    }

    private async salvar(alvo: AlvoCaptura, caminho: string) {
        const data = { captura: caminho, capturadoEm: new Date() } as { captura: string; capturadoEm: Date };
        if (alvo.tipo === "dominio") await prisma.dominio.update({ where: { id: alvo.id }, data });
        if (alvo.tipo === "porta") await prisma.porta.update({ where: { id: alvo.id }, data });
        if (alvo.tipo === "diretorio") await prisma.diretorio.update({ where: { id: alvo.id }, data });
    }

    private async aplicarVazio(alvo: AlvoCaptura, pasta: string, modelo: string, temporario: string) {
        await rm(temporario, { recursive: true, force: true });
        const destinoFinal = path.join(pasta, `${alvo.tipo}-${alvo.id}.png`);
        await rm(destinoFinal, { force: true });
        await copyFile(modelo, destinoFinal);
        return this.caminhoRelativo(alvo, ".png");
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

    private caminhoRelativo(alvo: AlvoCaptura, extensao: string) {
        return `/recon/capturas/${alvo.tipo}-${alvo.id}${extensao}`;
    }

    private async obterPastaCapturas() {
        const pasta = path.join(process.cwd(), "public", "recon", "capturas");
        await mkdir(pasta, { recursive: true });
        return pasta;
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

export default ReconCapturaService;
