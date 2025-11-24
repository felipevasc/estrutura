import { useCallback } from "react";

const useChat = () => {
    const sendMessage = useCallback(async (projectId: number, messages: any[]) => {
        const response = await fetch('/api/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, messages })
        });
        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || errorText);
            } catch {
                throw new Error(errorText);
            }
        }
        return await response.json();
    }, []);

    const executeCommand = useCallback(async (projectId: number, command: any) => {
        const response = await fetch('/api/v1/chat/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, command })
        });
        if (!response.ok) {
             const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || errorText);
            } catch {
                throw new Error(errorText);
            }
        }
        return await response.json();
    }, []);

    return { sendMessage, executeCommand };
};

export default useChat;
