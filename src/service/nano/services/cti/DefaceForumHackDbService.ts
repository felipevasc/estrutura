import { NanoService } from "../../NanoService";
import prisma from "@/database";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { linhaComandoCti, saidaBrutaCti } from "./registroExecucaoCti";

type Payload = {
    dominioId: number;
    paginas?: number;
};

type EscutaPayload = {
    id: number;
    args: Payload | string;
};

class DefaceForumHackDbService extends NanoService {
    constructor() {
        super("DefaceForumHackDbService");
    }

    async initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "deface_forum_hack_db_check") {
                this.executar(payload as EscutaPayload).catch((erro: any) => {
                    this.error(`Erro não tratado em executar: ${erro.message}`, erro);
                });
            }
        });
    }

    private async executar({ id, args }: EscutaPayload) {
        try {
            const dados = typeof args === "string" ? JSON.parse(args) : args;
            const dominioId = dados?.dominioId;
            const paginas = dados?.paginas && dados.paginas > 0 ? dados.paginas : 10;
            if (!dominioId) {
                throw new Error("dominioId é obrigatório");
            }
            const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
            if (!dominio) {
                throw new Error(`Domínio com ID ${dominioId} não encontrado.`);
            }
            const { espelhos, comandos, saidas } = await this.buscarEspelhos(dominio.endereco, paginas);
            const criados = [] as any[];
            for (const url of espelhos) {
                const existente = await prisma.deface.findFirst({ where: { url, dominioId } });
                if (!existente) {
                    const criado = await prisma.deface.create({ data: { url, fonte: "Hack-DB", dominioId } });
                    criados.push(criado);
                }
            }
            const executedCommand = comandos.length ? comandos.join(" | ") : linhaComandoCti("hack-db", { dominio: dominio.endereco, paginas });
            const rawOutput = saidaBrutaCti(saidas.join("\n"));
            this.bus.emit("JOB_COMPLETED", { id, result: criados, executedCommand, rawOutput });
        } catch (erro: any) {
            this.bus.emit("JOB_FAILED", { id, error: erro.message });
        }
    }

    private async buscarEspelhos(endereco: string, paginas: number): Promise<{ espelhos: string[]; comandos: string[]; saidas: string[] }> {
        const resposta = await this.executarScriptPython(endereco, paginas);
        const conjunto = new Set<string>();
        for (const item of resposta.resultado) {
            if (typeof item === "string" && item.trim()) {
                conjunto.add(item.trim());
            }
        }
        return { espelhos: Array.from(conjunto), comandos: resposta.comandos, saidas: resposta.saidas };
    }

    private async executarScriptPython(endereco: string, paginas: number): Promise<{ resultado: string[]; comandos: string[]; saidas: string[] }> {
        const base = path.join(process.cwd(), "scripts", "python", "hack-db");
        const comandos: string[] = [];
        const saidas: string[] = [];
        await this.prepararAmbiente(base, comandos, saidas);
        const interpretador = this.obterInterpretador(base);
        const args = ["coletar.py", "--dominio", endereco, "--paginas", paginas.toString()];
        const saida = await this.executarProcesso(interpretador, args, base, comandos, saidas);
        const texto = saida.trim();
        if (!texto) {
            return { resultado: [] as string[], comandos, saidas };
        }
        try {
            const resultado = JSON.parse(texto);
            if (Array.isArray(resultado)) {
                return { resultado: resultado as string[], comandos, saidas };
            }
            return { resultado: [] as string[], comandos, saidas };
        } catch (erro: any) {
            throw new Error(`Falha ao interpretar retorno do Hack-DB: ${erro.message}`);
        }
    }

    private obterInterpretador(base: string) {
        const caminhoVenv = path.join(base, ".venv", "bin", "python3");
        if (fs.existsSync(caminhoVenv)) {
            return caminhoVenv;
        }
        return "python3";
    }

    private async prepararAmbiente(base: string, comandos?: string[], saidas?: string[]) {
        await fs.promises.mkdir(base, { recursive: true });
        const caminhoVenv = path.join(base, ".venv", "bin", "python3");
        if (!fs.existsSync(caminhoVenv)) {
            await this.executarProcesso("python3", ["-m", "venv", ".venv"], base, comandos, saidas);
        }
        await this.executarProcesso(caminhoVenv, ["-m", "pip", "install", "-r", "requirements.txt"], base, comandos, saidas);
    }

    private executarProcesso(comando: string, argumentos: string[], base: string, comandos?: string[], saidas?: string[]) {
        return new Promise<string>((resolver, rejeitar) => {
            const processo = spawn(comando, argumentos, { cwd: base });
            let resposta = "";
            let erro = "";
            processo.stdout.on("data", (dados) => {
                resposta += dados.toString();
            });
            processo.stderr.on("data", (dados) => {
                erro += dados.toString();
            });
            processo.on("close", (codigo) => {
                if (codigo === 0) {
                    comandos?.push(linhaComandoCti(comando, argumentos));
                    saidas?.push(saidaBrutaCti(resposta));
                    resolver(resposta);
                } else {
                    comandos?.push(linhaComandoCti(comando, argumentos));
                    saidas?.push(saidaBrutaCti(erro));
                    rejeitar(new Error(erro || `Falha ao executar ${comando}`));
                }
            });
            processo.on("error", (falha) => {
                comandos?.push(linhaComandoCti(comando, argumentos));
                saidas?.push(saidaBrutaCti(falha));
                rejeitar(falha);
            });
        });
    }
}

export default DefaceForumHackDbService;
