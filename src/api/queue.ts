import { useCallback, useMemo } from 'react';
import { Command, CommandStatus } from '@prisma/client';

type ConsultaFila = {
    projectId: number;
    status?: CommandStatus[];
    limite?: number;
    inicio?: number;
};

type RespostaFila = {
    total: number;
    registros: Command[];
};

const useQueue = () => {
    const addCommand = useCallback(async (command: string, args: any[] | Record<string, unknown>, projectId: number) => {
        const res = await fetch('/api/v1/queue/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                command,
                args,
                projectId,
            }),
        });
        const data = await res.json();
        return data;
    }, []);

    const getCommands = useCallback(async ({ projectId, status, limite, inicio }: ConsultaFila): Promise<RespostaFila> => {
        const parametros = new URLSearchParams();
        parametros.append('projectId', String(projectId));
        if (status?.length) parametros.append('status', status.join(','));
        if (limite) parametros.append('limite', String(limite));
        if (inicio) parametros.append('inicio', String(inicio));

        const res = await fetch(`/api/v1/queue?${parametros.toString()}`);
        const data = await res.json();
        return data;
    }, []);

    const cancelCommand = useCallback(async (commandId: number) => {
        const res = await fetch(`/api/v1/queue/${commandId}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        return data;
    }, []);


    return useMemo(() => ({
        addCommand,
        getCommands,
        cancelCommand,
    }), [addCommand, getCommands, cancelCommand]);
};

export default useQueue;
