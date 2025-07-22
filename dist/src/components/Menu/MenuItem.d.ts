export type MenuItemProps = {
    title: string;
    onClick?: () => void;
    subitems?: MenuItemProps[];
};
declare const MenuItem: React.FC<MenuItemProps>;
export default MenuItem;
