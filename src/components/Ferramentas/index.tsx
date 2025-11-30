"use client"
import StoreContext from "@/store";
import { useContext } from "react";
import FerramentasDominio from "./target/FerramentasDominio";
import FerramentasIp from "./target/FerramentasIp";
import FerramentasDiretorio from "./target/FerramentasDiretorio";
import FerramentasPorta from "./target/FerramentasPorta";

const Ferramentas = () => {
    const { selecaoTarget } = useContext(StoreContext);
    return <>
        {selecaoTarget?.get()?.tipo === "domain" && <FerramentasDominio />}
        {selecaoTarget?.get()?.tipo === "ip" && <FerramentasIp />}
        {selecaoTarget?.get()?.tipo === "porta" && <FerramentasPorta />}
        {selecaoTarget?.get()?.tipo === "diretorio" && <FerramentasDiretorio />}
    </>
}

export default Ferramentas;