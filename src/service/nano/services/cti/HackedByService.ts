import { Dominio } from "@prisma/client";
import { CtiSearchService } from "./CtiSearchService";

class HackedByService extends CtiSearchService {
    constructor() {
        super("HackedByService", "hackedby_check");
    }

    protected getDork(dominio: Dominio): string {
        return `site:${dominio.endereco} "hacked by"`;
    }

    protected getFonte(): string {
        return "Google-HackBY";
    }
}

export default HackedByService;
