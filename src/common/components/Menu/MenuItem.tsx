'use client'

import { useState } from "react"

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

    return <li className={`nivel-menu ${!!subitems?.length && active ? 'ativo' : ''}`}>
        <a className={`menu-item ${!!subitems?.length ? 'bold' : ''}`} onClick={handleClick}>
            <span className="content">{title}</span>
            {!!subitems?.length && <span className="icon">
                <i className={`fas ${active ? 'fa-angle-down' : 'fa-angle-left'}`} aria-hidden="true"></i>
            </span>}
        </a>
        {!!subitems?.length && active && <ul>
            {subitems.map((i, idx) => <MenuItem key={`menu-submenu-${i.title}-${idx}`} {...i} />)}
        </ul>}
    </li>
}

export default MenuItem