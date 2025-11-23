import React from 'react';
import ArvoreDominios from "../components/Explorer/arvores/ArvoreDominios";
import ArvoreUsuarios from "../components/Explorer/arvores/ArvoreUsuarios";

export const viewRegistry: Record<string, React.ReactNode> = {
    'user': <ArvoreUsuarios />,
    'domain': <ArvoreDominios />, // Default fallback often implied as NOT 'user'
};

export const getDefaultView = () => <ArvoreDominios />;
