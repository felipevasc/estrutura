'use client';
import { useState } from "react";
const MenuItem = ({ onClick, subitems, title }) => {
    const [active, setActive] = useState(!(subitems === null || subitems === void 0 ? void 0 : subitems.length));
    const handleClick = () => {
        if (subitems === null || subitems === void 0 ? void 0 : subitems.length) {
            setActive(b => !b);
        }
        if (onClick) {
            onClick();
        }
    };
    return <li className={`nivel-menu ${!!(subitems === null || subitems === void 0 ? void 0 : subitems.length) && active ? 'ativo' : ''}`}>
        <a className={`menu-item ${!!(subitems === null || subitems === void 0 ? void 0 : subitems.length) ? 'bold' : ''}`} onClick={handleClick}>
            <span className="content">{title}</span>
            {!!(subitems === null || subitems === void 0 ? void 0 : subitems.length) && <span className="icon">
                <i className={`fas ${active ? 'fa-angle-down' : 'fa-angle-left'}`} aria-hidden="true"></i>
            </span>}
        </a>
        {!!(subitems === null || subitems === void 0 ? void 0 : subitems.length) && active && <ul>
            {subitems.map((i, idx) => <MenuItem key={`menu-submenu-${i.title}-${idx}`} {...i}/>)}
        </ul>}
    </li>;
};
export default MenuItem;
