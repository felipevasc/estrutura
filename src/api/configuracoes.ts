const useConfiguracoes = () => {
    const getConfig = async () => {
        const response = await fetch('/api/v1/configuracoes');
        if (!response.ok) {
            throw new Error('Falha ao buscar configurações');
        }
        return response.json();
    };

    const saveConfig = async (data: any) => {
        const response = await fetch('/api/v1/configuracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Falha ao salvar configurações');
        }
        return response.json();
    };

    return {
        getConfig,
        saveConfig,
    };
};

export default useConfiguracoes;
