import * as dominio from "./functions/dominio"
import * as ip from "./functions/ip"

const Database = {
    ...dominio,
    ...ip
}

export default Database;