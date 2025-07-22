import { MenuItemProps } from './MenuItem';
import './styles.css';
export type MenuProps = {
    items: MenuItemProps[];
};
declare const Menu: React.FC<MenuProps>;
export default Menu;
