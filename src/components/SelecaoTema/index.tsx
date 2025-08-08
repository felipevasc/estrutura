import { useContext, useState } from "react";
import StoreContext from "@/store";
import { TemaType } from "@/types/TemaType";
import { DropdownContainer, DropdownButton, DropdownContent } from "@/components/SelecaoProjetos/styles";

const opcoes: { valor: TemaType; nome: string }[] = [
    { valor: "classico", nome: "Clássico" },
    { valor: "hacker", nome: "Hacker" },
    { valor: "fofinho", nome: "Fofinho" },
    { valor: "elegante", nome: "Elegante" },
    { valor: "dark", nome: "Dark" },
    { valor: "clean", nome: "Clean" }
];

const SelecaoTema = () => {
    const { tema } = useContext(StoreContext);
    const [aberto, setAberto] = useState(false);
    const atual = opcoes.find(o => o.valor === tema?.get())?.nome ?? "Tema";

    return (
        <DropdownContainer>
            <DropdownButton onClick={() => setAberto(!aberto)}>
                {atual}
            </DropdownButton>
            {aberto && (
                <DropdownContent>
                    {opcoes.map(o => (
                        <a key={o.valor} onClick={() => { tema?.set(o.valor); setAberto(false); }}>
                            {o.nome}
                        </a>
                    ))}
                </DropdownContent>
            )}
        </DropdownContainer>
    );
};

export default SelecaoTema;
