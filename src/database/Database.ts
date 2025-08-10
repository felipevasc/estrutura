import * as dominio from "./functions/dominio"
import * as ip from "./functions/ip"
import * as samba from "./functions/samba"

const Database = {
    ...dominio,
    ...ip,
    ...samba
}

export default Database;