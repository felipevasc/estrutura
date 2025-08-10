import * as dominio from "./functions/dominio"
import * as ip from "./functions/ip"
import * as usuario from "./functions/usuario"

const Database = {
    ...dominio,
    ...ip,
    ...usuario
}

export default Database;