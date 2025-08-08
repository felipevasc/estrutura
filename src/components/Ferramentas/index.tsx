"use client"
import StoreContext from "@/store";
import { useContext } from "react";
import FerramentasDominio from "./target/FerramentasDominio";
import FerramentasIp from "./target/FerramentasIp";

const Ferramentas = () => {
    const { selecaoTarget } = useContext(StoreContext);
    return <>
        {selecaoTarget?.get()?.tipo === "domain" && <FerramentasDominio />}
        {selecaoTarget?.get()?.tipo === "ip" && <FerramentasIp />}
    </>
}

export default Ferramentas;