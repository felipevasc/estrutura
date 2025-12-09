import { Dominio } from "@prisma/client";
import { CtiSearchService } from "./CtiSearchService";
import { salvarVazamentos } from "./infoDisclosureProcessador";

class InfoDisclosurePasteService extends CtiSearchService {
    constructor() {
        super("InfoDisclosurePasteService", "info_disclosure_paste");
    }

    protected async processResults(items: any[], dominio: Dominio, fonte: string): Promise<any[]> {
        return salvarVazamentos(items, dominio, fonte);
    }

    protected async getDork(dominio: Dominio): Promise<string> {
        const termo = dominio.endereco;
        const origens = ["pastebin.com", "ghostbin.com", "hastebin.com", "rentry.co"];
        return origens.map(origem => `(\"${termo}\" site:${origem})`).join(" OR ");
    }

    protected getFonte(): string {
        return "Pastes";
    }
}

export default InfoDisclosurePasteService;
