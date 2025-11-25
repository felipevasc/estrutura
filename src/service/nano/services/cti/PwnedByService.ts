import { Dominio } from "@prisma/client";
import { CtiSearchService } from "./CtiSearchService";

class PwnedByService extends CtiSearchService {
    constructor() {
        super("PwnedByService", "pwnedby_check");
    }

    protected getDork(dominio: Dominio): string {
        return `site:${dominio.endereco} "pwned by"`;
    }

    protected getFonte(): string {
        return "Google-PwnedBy";
    }
}

export default PwnedByService;
