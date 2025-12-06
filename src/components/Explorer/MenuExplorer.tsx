"use client"
import { StyledMenuExplorer } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe, faSitemap, faUserFriends, faCogs, faNetworkWired } from "@fortawesome/free-solid-svg-icons"
import { useContext } from "react"
import StoreContext from "@/store"
import { Tooltip } from "antd"

const MenuExplorer = () => {
    const { explorer } = useContext(StoreContext);
    const current = explorer?.get();

    return <StyledMenuExplorer>
        <Tooltip title="Domínios">
            <button className={current === "domain" ? "active" : ""} onClick={() => explorer?.set("domain")}>
                <FontAwesomeIcon icon={faGlobe} />
            </button>
        </Tooltip>
        <Tooltip title="DNS">
            <button className={current === "dns" ? "active" : ""} onClick={() => explorer?.set("dns")}>
                <FontAwesomeIcon icon={faNetworkWired} />
            </button>
        </Tooltip>
        <Tooltip title="Rede">
            <button className={current === "network" ? "active" : ""} onClick={() => explorer?.set("network")}>
                <FontAwesomeIcon icon={faSitemap} />
            </button>
        </Tooltip>
        <Tooltip title="Usuários">
            <button className={current === "user" ? "active" : ""} onClick={() => explorer?.set("user")}>
                <FontAwesomeIcon icon={faUserFriends} />
            </button>
        </Tooltip>
        <Tooltip title="Serviços">
            <button className={current === "service" ? "active" : ""} onClick={() => explorer?.set("service")}>
                <FontAwesomeIcon icon={faCogs} />
            </button>
        </Tooltip>
    </StyledMenuExplorer>
}

export default MenuExplorer
