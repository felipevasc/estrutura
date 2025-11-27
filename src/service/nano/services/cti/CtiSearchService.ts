import { NanoService } from "../../NanoService";
import prisma from "@/database";
import { Dominio } from "@prisma/client";

type CheckPayload = {
    dominioId: number;
    // Permitir argumentos extras na payload base
    [key: string]: any;
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
            if (payload.command === this.command) {
                this.log(`Comando '${this.command}' recebido. Iniciando processamento...`);
                // Precisamos garantir que o 'this' no handleCheck seja a instância do serviço
                this.handleCheck(payload).catch(err => {
                    this.error(`Erro não tratado em handleCheck: ${err.message}`, err);
                });
            }
        });
    }

    // Agora getDork pode receber args opcionais
    protected abstract getDork(dominio: Dominio, args?: any): string | Promise<string>;
    protected abstract getFonte(args?: any): string;

    private async handleCheck({ id, args }: { id: number, args: any }) {
        try {
            let parsedArgs: CheckPayload;
            
            if (typeof args === 'string') {
                try {
                    parsedArgs = JSON.parse(args);
                } catch (e) {
                    throw new Error("Falha ao fazer parse dos argumentos JSON");
                }
            } else {
                parsedArgs = args;
            }

            const { dominioId } = parsedArgs;
            if (!dominioId) {
                throw new Error("dominioId é obrigatório");
            }

            const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
            if (!dominio) {
                throw new Error(`Domínio com ID ${dominioId} não encontrado.`);
            }

            const dork = await this.getDork(dominio, parsedArgs);
            const fonte = this.getFonte(parsedArgs);

            this.log(`Executando busca com Dork: ${dork} (Fonte: ${fonte})`);

            // Limitar a busca se a dork for muito longa ou dividir em múltiplas chamadas é algo
            // que pode ser tratado aqui ou na implementação da dork.
            // O Google Custom Search tem limite de ~2048 chars na URL.

            const result = await this.searchWithApi(dork);
            const createdItems = [];

            if (result.items) {
                for (const item of result.items) {
                    // Evitar duplicatas óbvias
                    const exists = await prisma.deface.findFirst({
                        where: {
                            url: item.link,
                            dominioId: dominio.id
                        }
                    });

                    if (!exists) {
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
            }
            this.log(`Processamento concluído. Encontrados ${createdItems.length} novos resultados.`);
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

        // Codificar corretamente a dork
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(dork)}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            const errorMessage = errorBody?.error?.message || response.statusText;
            const detailedError = `Erro na API do Google (${response.status}): ${errorMessage}`;
            throw new Error(detailedError);
        }

        return await response.json();
    }
}
