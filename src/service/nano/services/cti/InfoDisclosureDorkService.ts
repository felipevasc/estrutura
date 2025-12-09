import { Dominio } from "@prisma/client";
import { CtiSearchService } from "./CtiSearchService";
import fs from 'fs/promises';
import path from 'path';
import { salvarVazamentos } from "./infoDisclosureProcessador";

// Caminho para o arquivo de configuração
const CONFIG_PATH = path.join(process.cwd(), 'src/config/dorks_disclosure.json');

class InfoDisclosureDorkService extends CtiSearchService {
    constructor() {
        super("InfoDisclosureDorkService", "info_disclosure_check");
    }

    protected async processResults(items: any[], dominio: Dominio, fonte: string): Promise<any[]> {
        return salvarVazamentos(items, dominio, fonte);
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

        const terms = dorks.map(d => `"${d}"`).join(" OR ");
        // Utilizar site:dominio.com para restringir a busca
        return `site:${dominio.endereco} (${terms})`;
    }

    protected getFonte(args?: any): string {
        const category = args?.category || 'Desconhecido';
        // Capitalizar a primeira letra
        const formatted = category.charAt(0).toUpperCase() + category.slice(1);
        return `Dork [${formatted}]`;
    }
}

export default InfoDisclosureDorkService;
