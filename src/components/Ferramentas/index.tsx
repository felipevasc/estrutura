"use client"
import StoreContext from "@/store";
import { useContext } from "react";
import FerramentasDominio from "./target/FerramentasDominio";

const Ferramentas = () => {
    const { selecaoTarget } = useContext(StoreContext);
    return <>
    {selecaoTarget?.get()?.tipo === "domain" && <FerramentasDominio />}
    </>
}

export default Ferramentas;