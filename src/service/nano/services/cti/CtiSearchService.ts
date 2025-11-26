import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { Dominio } from "@prisma/client";

type CheckPayload = {
    dominioId: number;
}

type SearchApiResult = {
    items?: {
        link: string;
    }[];
}

export abstract class CtiSearchService extends NanoService {

    constructor(name: string, private command: string) {
        super(name);
    }

    async initialize() {
        this.log(`Inicializado. Ouvindo pelo comando: '${this.command}'`);
        this.listen('COMMAND_RECEIVED', (payload) => {
            // Log para ver todos os comandos que este serviço recebe
            // this.log(`Evento COMMAND_RECEIVED capturado com comando: '${payload.command}'`);
            if (payload.command === this.command) {
                this.log(`Comando '${this.command}' recebido. Iniciando processamento...`);
                this.handleCheck(payload);
            }
        });
    }

    protected abstract getDork(dominio: Dominio): string;
    protected abstract getFonte(): string;

    private async handleCheck({ id, args }: { id: number, args: string }) {
        try {
            console.log(typeof args)
            let parsedArgs: CheckPayload;
            
            if (typeof args === 'string') {
                parsedArgs = JSON.parse(args);
            } else {
                parsedArgs = args;
            }
            const { dominioId } = parsedArgs;
            const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
            if (!dominio) {
                throw new Error(`Domínio com ID ${dominioId} não encontrado.`);
            }

            const dork = this.getDork(dominio);
            const fonte = this.getFonte();
            const result = await this.searchWithApi(dork);
            const createdItems = [];

            if (result.items) {
                for (const item of result.items) {
                    const created = await prisma.deface.create({
                        data: {
                            url: item.link,
                            fonte,
                            dominioId: dominio.id,
                        }
                    });
                    createdItems.push(created);
                }
            }
            this.log(`Processamento concluído. Encontrados ${createdItems.length} resultados.`);
            this.bus.emit('JOB_COMPLETED', { id, result: createdItems });
        } catch (error: any) {
            this.error(`Falha no processamento: ${error.message}`, error);
            this.bus.emit('JOB_FAILED', { id, error: error.message });
        }
    }

    private async searchWithApi(dork: string): Promise<SearchApiResult> {
        const apiKey = process.env.GOOGLE_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!apiKey || !searchEngineId) {
            throw new Error("As credenciais GOOGLE_API_KEY e GOOGLE_SEARCH_ENGINE_ID devem ser configuradas no ambiente.");
        }

        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(dork)}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            const errorMessage = errorBody?.error?.message || response.statusText;
            const detailedError = `Erro na API do Google (${response.status}): ${errorMessage}. Verifique se as suas credenciais (API Key e Search Engine ID) são válidas e se a API está ativada.`;
            throw new Error(detailedError);
        }

        return await response.json();
    }
}
