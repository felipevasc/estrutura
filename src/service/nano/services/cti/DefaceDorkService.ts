import { Dominio } from "@prisma/client";
import { CtiSearchService } from "./CtiSearchService";
import prisma from "@/database";
import fs from 'fs/promises';
import path from 'path';

// Caminho para o arquivo de configuração
const CONFIG_PATH = path.join(process.cwd(), 'src/config/dorks.json');

class DefaceDorkService extends CtiSearchService {
    constructor() {
        super("DefaceDorkService", "deface_dork_check");
    }

    protected async processResults(items: any[], dominio: Dominio, fonte: string): Promise<any[]> {
        const createdItems = [];
        for (const item of items) {
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
        return createdItems;
    }

    protected async getDork(dominio: Dominio, args: any): Promise<string> {
        const category = args?.category;

        if (!category) {
            throw new Error("Categoria de dork não especificada na carga de trabalho.");
        }

        let dorks: string[] = [];
        try {
            const data = await fs.readFile(CONFIG_PATH, 'utf-8');
            const config = JSON.parse(data);
            dorks = config[category] || [];
        } catch (err) {
            this.error("Erro ao ler arquivo de configuração de dorks.", err);
            // Fallback vazio ou erro
            throw new Error(`Não foi possível carregar as dorks para a categoria '${category}'.`);
        }

        if (dorks.length === 0) {
            throw new Error(`Nenhuma dork encontrada para a categoria '${category}'.`);
        }

        // Construir a query: site:dominio.com ("termo1" OR "termo2" OR ...)
        // Nota: O Google tem limite de query. Se a lista for muito grande,
        // idealmente deveríamos quebrar em múltiplas buscas.
        // Por enquanto, vamos assumir que cabe, ou pegar os primeiros N.

        const terms = dorks.map(d => `"${d}"`).join(" OR ");
        return `site:${dominio.endereco} (${terms})`;
    }

    protected getFonte(args?: any): string {
        const category = args?.category || 'Desconhecido';
        // Capitalizar a primeira letra
        const formatted = category.charAt(0).toUpperCase() + category.slice(1);
        return `Dork [${formatted}]`;
    }
}

export default DefaceDorkService;
