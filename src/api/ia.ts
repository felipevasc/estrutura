import { AiCommandSuggestion, ChatMessage } from "@/types/AiChat";

const useIa = () => {
    const chat = async (projectId: number, messages: ChatMessage[]) => {
        const res = await fetch('/api/v1/ia/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectId, messages })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error?.message || 'Falha ao consultar IA');
        }

        return res.json() as Promise<{ content: string }>;
    };

    const executarSugestao = async (projectId: number, suggestion: AiCommandSuggestion) => {
        const res = await fetch('/api/v1/ia/commands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectId, suggestion })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || 'Não foi possível executar o comando sugerido');
        }

        return data;
    };

    return {
        chat,
        executarSugestao
    };
};

export default useIa;
