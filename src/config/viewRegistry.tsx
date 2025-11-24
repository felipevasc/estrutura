import React from 'react';
import ArvoreDominios from "../components/Explorer/arvores/ArvoreDominios";
import ArvoreUsuarios from "../components/Explorer/arvores/ArvoreUsuarios";
import ArvoreRedes from "../components/Explorer/arvores/ArvoreRedes";
import ArvoreServicos from "../components/Explorer/arvores/ArvoreServicos";

export const viewRegistry: Record<string, React.ReactNode> = {
    'user': <ArvoreUsuarios />,
    'domain': <ArvoreDominios />,
    'network': <ArvoreRedes />,
    'service': <ArvoreServicos />,
};

export const getDefaultView = () => <ArvoreDominios />;
