"use client"
import StoreContext from "@/store";
import { useContext } from "react";
import FerramentasDominio from "./target/FerramentasDominio";
import FerramentasIp from "./target/FerramentasIp";

const Ferramentas = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const target = selecaoTarget?.get();

    return (
        <>
            {target?.tipo === "domain" && <FerramentasDominio />}
            {target?.tipo === "ip" && <FerramentasIp />}
        </>
    );
}

export default Ferramentas;