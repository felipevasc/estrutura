"use client"
import StoreContext from "@/store"
import { useContext } from "react"
import VisualizarDominio from "./target/VisualizarDominio";

const Visualizador = () => {
    const { selecaoTarget } = useContext(StoreContext);
    return <>
        {selecaoTarget?.get()?.tipo === "domain" && <VisualizarDominio />}
    </>
}

export default Visualizador