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
        this.listen('COMMAND_RECEIVED', (payload) => {
            if (payload.command === this.command) {
                this.handleCheck(payload);
            }
        });
    }

    protected abstract getDork(dominio: Dominio): string;
    protected abstract getFonte(): string;

    private async handleCheck({ id, args }: { id: number, args: CheckPayload }) {
        try {
            const { dominioId } = args;
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
            this.bus.emit('JOB_COMPLETED', { id, result: createdItems });
        } catch (error: any) {
            this.bus.emit('JOB_FAILED', { id, error: error.message });
        }
    }

    private async searchWithApi(dork: string): Promise<SearchApiResult> {
        const apiKey = process.env.GOOGLE_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!apiKey || !searchEngineId) {
            this.error("Chaves da API do Google não configuradas.");
            return {};
        }

        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(dork)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                this.error(`Erro ao buscar na API do Google: ${response.statusText}`);
                return {};
            }
            return await response.json();
        } catch (error) {
            this.error("Falha na requisição para a API do Google:", error);
            return {};
        }
    }
}
