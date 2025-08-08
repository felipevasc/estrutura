import * as dominio from "./functions/dominio"
import * as ip from "./functions/ip"
import * as porta from "./functions/porta"
import * as ipinfo from "./functions/ipinfo"

const Database = {
    ...dominio,
    ...ip,
    ...porta,
    ...ipinfo
}

export default Database;