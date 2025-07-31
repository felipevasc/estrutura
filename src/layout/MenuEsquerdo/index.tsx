import { Menu } from "@/common/components";
import { StyledMenuEsquerdo } from "./styles";

const MenuEsquerdo = () => {
    return <StyledMenuEsquerdo>
        <Menu items={[{ title: 'Item 1' }, { title: 'Item 2' }]} />
    </StyledMenuEsquerdo>
}

export default MenuEsquerdo;