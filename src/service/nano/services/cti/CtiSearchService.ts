import { NanoService } from "../..";
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
        this.listen(this.command, this.handleCheck);
    }

    protected abstract getDork(dominio: Dominio): string;
    protected abstract getFonte(): string;

    private async handleCheck(payload: CheckPayload) {
        const { dominioId } = payload;
        const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
        if (!dominio) {
            console.error(`[${this.name}] Domínio com ID ${dominioId} não encontrado.`);
            return;
        }

        const dork = this.getDork(dominio);
        const fonte = this.getFonte();
        const result = await this.searchWithApi(dork);

        if (result.items) {
            for (const item of result.items) {
                await prisma.deface.create({
                    data: {
                        url: item.link,
                        fonte,
                        dominioId: dominio.id,
                    }
                });
            }
        }
    }

    private async searchWithApi(dork: string): Promise<SearchApiResult> {
        const apiKey = process.env.GOOGLE_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!apiKey || !searchEngineId) {
            console.error(`[${this.name}] Chaves da API do Google não configuradas.`);
            return {};
        }

        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(dork)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`[${this.name}] Erro ao buscar na API do Google: ${response.statusText}`);
                return {};
            }
            return await response.json();
        } catch (error) {
            console.error(`[${this.name}] Falha na requisição para a API do Google:`, error);
            return {};
        }
    }
}
