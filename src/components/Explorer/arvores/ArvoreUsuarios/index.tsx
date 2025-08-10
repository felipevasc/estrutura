import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import ElementoUsuario from "../../target/ElementoUsuario";
import { Tree } from "src/common/components/Menu";

const ArvoreUsuarios = () => {
    const { projeto } = useContext(StoreContext);
    const api = useApi();

    const id = projeto?.get()?.id ?? 0;
    const { data: usuarios, isLoading } = api.projeto.getUsuarios(id);

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    return (
        <Tree>
            {usuarios?.map((usuario: any) => (
                <ElementoUsuario key={usuario.id} usuario={usuario} />
            ))}
        </Tree>
    );
};

export default ArvoreUsuarios;
