import { useContext } from "react";
import StoreContext from "@/store";
import { TemaType } from "@/types/TemaType";
import { StyledSelect } from "./styles";

const SelecaoTema = () => {
    const { tema } = useContext(StoreContext);
    const atual = tema?.get() ?? "sombrio";

    return (
        <StyledSelect value={atual} onChange={e => tema?.set(e.target.value as TemaType)}>
            <option value="classico">Clássico</option>
            <option value="hacker">Hacker</option>
            <option value="fofo">Fofinho</option>
            <option value="elegante">Elegante</option>
            <option value="sombrio">Dark</option>
            <option value="clean">Clean</option>
        </StyledSelect>
    );
};

export default SelecaoTema;
