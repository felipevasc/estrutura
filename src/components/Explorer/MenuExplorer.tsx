"use client"
import { Button } from "@/common/components"
import { StyledMenuExplorer } from "./styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDatabase, faGlobe, faNetworkWired, faSitemap, faUser, faUserFriends, faWebAwesome, faServer } from "@fortawesome/free-solid-svg-icons"
import { useContext } from "react"
import StoreContext from "@/store"

const MenuExplorer = () => {
    const { explorer } = useContext(StoreContext);
    return <StyledMenuExplorer>
        <Button type="primary" darkMode={true} checked={explorer?.get() === "domain"} onClick={() => explorer?.set("domain")}>
            <FontAwesomeIcon icon={faGlobe} />
        </Button>
        <Button type="primary" darkMode={true} checked={explorer?.get() === "ip"} onClick={() => explorer?.set("ip")}>
            <FontAwesomeIcon icon={faServer} />
        </Button>
        <Button type="primary" darkMode={true} checked={explorer?.get() === "network"} onClick={() => explorer?.set("network")}>
            <FontAwesomeIcon icon={faSitemap} />
        </Button>
        <Button type="primary" darkMode={true} checked={explorer?.get() === "user"} onClick={() => explorer?.set("user")}>
            <FontAwesomeIcon icon={faUserFriends} />
        </Button>
        <Button type="primary" darkMode={true} checked={explorer?.get() === "database"} onClick={() => explorer?.set("database")}>
            <FontAwesomeIcon icon={faDatabase} />
        </Button>
    </StyledMenuExplorer>
}

export default MenuExplorer