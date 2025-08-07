const useQueue = () => {
    const addCommand = async (command: string, args: any[], projectId: number) => {
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
    };

    const getCommands = async (projectId: number) => {
        const res = await fetch(`/api/v1/queue?projectId=${projectId}`);
        const data = await res.json();
        return data;
    }

    const cancelCommand = async (commandId: number) => {
        const res = await fetch(`/api/v1/queue/${commandId}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        return data;
    }


    return {
        addCommand,
        getCommands,
        cancelCommand,
    };
};

export default useQueue;
