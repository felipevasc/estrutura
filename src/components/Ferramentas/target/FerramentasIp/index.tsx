"use client";

import { Card } from "antd";
import { StyledFerramentasIp } from "./styles";
import { useContext } from "react";
import StoreContext from "@/store";
import {
    executarNmapAction,
    executarWhoisAction,
    executarDnsreconAction,
    executarWhatWebAction,
    executarNiktoAction,
    executarFeroxbusterAction,
    executarTestsslAction,
    executarNucleiAction,
    executarEnum4linuxAction,
    executarWebScreenshotAction,
} from "./actions";

const FerramentasIp = () => {
    const { selecaoTarget, projeto } = useContext(StoreContext);

    const handleAction = (action: (idIp: number, projectId: number) => void) => {
        const ipId = selecaoTarget?.get()?.id;
        const projectId = projeto?.get()?.id;
        if (ipId && projectId) {
            action(ipId, projectId);
        }
    };

    const tools = [
        { title: "Nmap", description: "Scan de portas, serviços e versões.", action: () => handleAction(executarNmapAction) },
        { title: "Whois", description: "Consulta de informações de registro do IP.", action: () => handleAction(executarWhoisAction) },
        { title: "Dnsrecon", description: "Enumeração de DNS e lookups reversos.", action: () => handleAction(executarDnsreconAction) },
        { title: "WhatWeb", description: "Identificação de tecnologias web.", action: () => handleAction(executarWhatWebAction) },
        { title: "Nikto", description: "Scan de vulnerabilidades em servidores web.", action: () => handleAction(executarNiktoAction) },
        { title: "Feroxbuster", description: "Descoberta de diretórios e arquivos web.", action: () => handleAction(executarFeroxbusterAction) },
        { title: "Testssl.sh", description: "Análise de configuração SSL/TLS.", action: () => handleAction(executarTestsslAction) },
        { title: "Nuclei", description: "Scan de vulnerabilidades baseado em templates.", action: () => handleAction(executarNucleiAction) },
        { title: "Enum4linux-ng", description: "Enumeração de sistemas Samba/Windows.", action: () => handleAction(executarEnum4linuxAction) },
        { title: "WebScreenshot", description: "Captura de tela de serviços web.", action: () => handleAction(executarWebScreenshotAction) },
    ];

    return (
        <StyledFerramentasIp>
            {tools.map(tool => (
                <Card
                    key={tool.title}
                    title={tool.title}
                    onClick={tool.action}
                >
                    <Card.Meta description={tool.description} />
                </Card>
            ))}
        </StyledFerramentasIp>
    );
};

export default FerramentasIp;
