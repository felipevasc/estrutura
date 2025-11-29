import * as dominio from "./functions/dominio"
import * as ip from "./functions/ip"
import * as usuario from "./functions/usuario"
import * as whatweb from "./functions/whatweb"

const Database = {
    ...dominio,
    ...ip,
    ...usuario,
    ...whatweb
}

export default Database;