"use client"
import StoreContext from "@/store"
import { useContext } from "react"
import VisualizarDominio from "./target/VisualizarDominio";
import VisualizarIp from "./target/VisualizarIp";
import VisualizarRede from "./target/VisualizarRede";
import VisualizarUsuario from "./target/VisualizarUsuario";
import VisualizarDatabase from "./target/VisualizarDatabase";

const Visualizador = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const target = selecaoTarget?.get();

    if (!target) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Selecione um alvo para ver os detalhes</h2>
                <p>Escolha um item na árvore à esquerda para começar.</p>
            </div>
        );
    }

    switch (target.tipo) {
        case "domain":
            return <VisualizarDominio />;
        case "ip":
            return <VisualizarIp />;
        case "network":
            return <VisualizarRede />;
        case "user":
            return <VisualizarUsuario />;
        case "database":
            return <VisualizarDatabase />;
        default:
            return (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>Tipo de alvo não reconhecido</h2>
                    <p>O tipo de alvo selecionado não tem uma visualização implementada.</p>
                </div>
            );
    }
}

export default Visualizador;