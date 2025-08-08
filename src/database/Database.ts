import * as dominio from "./functions/dominio"
import * as ip from "./functions/ip"
import * as porta from "./functions/porta"

const Database = {
    ...dominio,
    ...ip,
    ...porta
}

export default Database;