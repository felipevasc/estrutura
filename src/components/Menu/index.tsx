'use client'

import MenuItem, { MenuItemProps } from './MenuItem'
import './styles.css'

export type MenuProps = {
    items: MenuItemProps[]
}

const Menu: React.FC<MenuProps> = ({ items }) => {
    return <div className="br-menu push active">
        <div className="menu-container position-static shadow-lg-right">
            <div className="menu-panel h-auto position-static">
                <nav className="menu-body">
                    <div className="menu-folder active">
                        <ul>

                        {items.map((i, idx) => <MenuItem key={`menu-item-${i.title}-${idx}`} {...i} />)}
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
    </div>
}

export default Menu