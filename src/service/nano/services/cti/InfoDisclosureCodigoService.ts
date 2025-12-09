import { Dominio } from "@prisma/client";
import { CtiSearchService } from "./CtiSearchService";
import { salvarVazamentos } from "./infoDisclosureProcessador";

class InfoDisclosureCodigoService extends CtiSearchService {
    constructor() {
        super("InfoDisclosureCodigoService", "info_disclosure_codigo");
    }

    protected async processResults(items: any[], dominio: Dominio, fonte: string): Promise<any[]> {
        return salvarVazamentos(items, dominio, fonte);
    }

    protected async getDork(dominio: Dominio): Promise<string> {
        const termo = dominio.endereco;
        const trechos = ["github.com", "gitlab.com", "bitbucket.org"];
        const filtros = trechos.map(origem => `(\"${termo}\" site:${origem})`).join(" OR ");
        return filtros;
    }

    protected getFonte(): string {
        return "Repositórios";
    }
}

export default InfoDisclosureCodigoService;
