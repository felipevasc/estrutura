'use client'

import MenuItem, { MenuItemProps } from './MenuItem'
import { StyledMenu, StyledMenuNav, StyledMenuFolder } from './styles'

export type MenuProps = {
    items: MenuItemProps[]
}

const Menu: React.FC<MenuProps> = ({ items }) => {
    return (
        <StyledMenu>
            <StyledMenuNav>
                <StyledMenuFolder>
                    <ul>
                        {items.map((i, idx) => <MenuItem key={`menu-item-${i.title}-${idx}`} {...i} />)}
                    </ul>
                </StyledMenuFolder>
            </StyledMenuNav>
        </StyledMenu>
    )
}

export default Menu