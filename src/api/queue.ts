import { useCallback, useMemo } from 'react';

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

    const getCommands = useCallback(async (projectId: number) => {
        const res = await fetch(`/api/v1/queue?projectId=${projectId}`);
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
