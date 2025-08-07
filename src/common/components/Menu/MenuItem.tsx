'use client'

import { useState } from "react"
import { StyledMenuItem, StyledSubMenu } from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleLeft } from "@fortawesome/free-solid-svg-icons";

export type MenuItemProps = {
    title: string,
    onClick?: () => void,
    subitems?: MenuItemProps[],
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, subitems, title }) => {
    const [active, setActive] = useState(!subitems?.length);

    const handleClick = () => {
        if (subitems?.length) {
            setActive(b => !b)
        }
        if (onClick) {
            onClick()
        }
    }

    return <li>
        <StyledMenuItem className={`${!!subitems?.length ? 'bold' : ''}`} onClick={handleClick}>
            <span className="content">{title}</span>
            {!!subitems?.length && <span className="icon">
                <FontAwesomeIcon icon={active ? faAngleDown : faAngleLeft} />
            </span>}
        </StyledMenuItem>
        {!!subitems?.length && active && <StyledSubMenu>
            {subitems.map((i, idx) => <MenuItem key={`menu-submenu-${i.title}-${idx}`} {...i} />)}
        </StyledSubMenu>}
    </li>
}

export default MenuItem