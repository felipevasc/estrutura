"use client"
import StoreContext from "@/store";
import { useContext } from "react";
import FerramentasDominio from "./target/FerramentasDominio";
import FerramentasIp from "./target/FerramentasIp";

const Ferramentas = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const targetType = selecaoTarget?.get()?.tipo;

    return (
        <>
            {targetType === "domain" && <FerramentasDominio />}
            {targetType === "ip" && <FerramentasIp />}
        </>
    );
}

export default Ferramentas;