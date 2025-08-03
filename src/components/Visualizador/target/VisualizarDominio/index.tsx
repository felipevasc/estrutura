import useApi from "@/api";
import StoreContext from "@/store"
import { useContext } from "react"

const VisualizarDominio = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idDominio = selecaoTarget?.get()?.id;
    const { data: dominio } = api.dominios.getDominio(idDominio);
    return <h4>{dominio?.alias} - {dominio?.endereco}</h4>;
}

export default VisualizarDominio;