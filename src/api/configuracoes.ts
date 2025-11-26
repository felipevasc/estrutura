import { useCallback, useMemo } from "react";

const useConfiguracoes = () => {
    const getConfig = useCallback(async () => {
        const response = await fetch('/api/v1/configuracoes');
        if (!response.ok) {
            throw new Error('Falha ao buscar configurações');
        }
        return response.json();
    }, []);

    const saveConfig = useCallback(async (data: any) => {
        const response = await fetch('/api/v1/configuracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Falha ao salvar configurações');
        }
        return response.json();
    }, []);

    return useMemo(() => ({
        getConfig,
        saveConfig,
    }), [getConfig, saveConfig]);
};

export default useConfiguracoes;
