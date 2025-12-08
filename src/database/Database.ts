import * as dominio from "./functions/dominio"
import * as ip from "./functions/ip"
import * as usuario from "./functions/usuario"
import * as whatweb from "./functions/whatweb"
import * as informacaoDominio from "./functions/informacaoDominio"

const Database = {
    ...dominio,
    ...ip,
    ...usuario,
    ...whatweb,
    ...informacaoDominio
}

export default Database;