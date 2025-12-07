import { NanoService } from "../../NanoService";
import prisma from "@/database";
import puppeteer from "puppeteer";
import { linhaComandoCti, saidaBrutaCti } from "./registroExecucaoCti";

type Payload = {
    dominioId: number;
    paginas?: number;
};

type EscutaPayload = {
    id: number;
    args: Payload | string;
};

class DefaceForumZoneXsecService extends NanoService {
    constructor() {
        super("DefaceForumZoneXsecService");
    }

    async initialize() {
        this.listen("COMMAND_RECEIVED", (payload) => {
            if (payload.command === "deface_forum_zone_xsec_check") {
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
            const espelhos = await this.buscarEspelhos(dominio.endereco, paginas);
            const criados = [] as any[];
            for (const url of espelhos) {
                const existente = await prisma.deface.findFirst({ where: { url, dominioId } });
                if (!existente) {
                    const criado = await prisma.deface.create({ data: { url, fonte: "Zone-Xsec", dominioId } });
                    criados.push(criado);
                }
            }
            const executedCommand = linhaComandoCti("zone-xsec", { dominio: dominio.endereco, paginas });
            const rawOutput = saidaBrutaCti(espelhos);
            this.bus.emit("JOB_COMPLETED", { id, result: criados, executedCommand, rawOutput });
        } catch (erro: any) {
            this.bus.emit("JOB_FAILED", { id, error: erro.message });
        }
    }

    private async buscarEspelhos(endereco: string, paginas: number) {
        const alvo = endereco.toLowerCase();
        const espelhos: string[] = [];
        const navegador = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true, args: ["--ignore-certificate-errors", "--ignore-certificate-errors-spki-list"] });
        const pagina = await navegador.newPage();
        try {
            for (let indice = 1; indice <= paginas; indice += 1) {
                await pagina.goto(`https://zone-xsec.com/archive/page=${indice}`, { waitUntil: "domcontentloaded", timeout: 60000 });
                await pagina.waitForSelector("#page-wrapper", { timeout: 60000 });
                const urls = await pagina.$$eval("table.mirror-table tbody tr", (linhas, alvoTexto) => {
                    const coletados: string[] = [];
                    linhas.forEach((linha) => {
                        const colunas = Array.from(linha.querySelectorAll("td"));
                        const alvoColuna = (colunas[8]?.textContent || "").toLowerCase();
                        if (!alvoColuna.includes(alvoTexto)) {
                            return;
                        }
                        const link = linha.querySelector('td a[href*="/mirror/"]');
                        const href = link?.getAttribute("href") || "";
                        if (!href) {
                            return;
                        }
                        coletados.push(`https://zone-xsec.com${href}`);
                    });
                    return coletados;
                }, alvo);
                for (const url of urls) {
                    if (!espelhos.includes(url)) {
                        espelhos.push(url);
                    }
                }
            }
        } finally {
            await pagina.close();
            await navegador.close();
        }
        return espelhos;
    }
}

export default DefaceForumZoneXsecService;
