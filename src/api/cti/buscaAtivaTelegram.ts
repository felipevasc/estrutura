import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { FonteVazamento } from './fontesVazamento';

export interface BuscaAtivaTelegram {
    id: number;
    fonteId: number;
    extensoes: string[];
    ultimaCapturaSucesso?: string | null;
    destinoCentral?: string | null;
    fonte: FonteVazamento;
}

const API_BASE_URL = '/api/v1/cti/vazamento/busca-ativa/telegram';

export const useBuscaAtivaTelegram = (projetoId?: number) => {
    const queryClient = useQueryClient();
    const queryKey = ['busca_ativa_telegram', projetoId];

    const { data: registros = [], isLoading, refetch } = useQuery<BuscaAtivaTelegram[]>({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (projetoId) params.append('projetoId', `${projetoId}`);
            const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
            if (!response.ok) throw new Error('Erro ao carregar buscas ativas de Telegram');
            return response.json();
        },
        enabled: true,
    });

    const handleResponse = async (res: Response) => {
        if (!res.ok) {
            const payload = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(payload.error || 'Erro ao processar requisição');
        }
        return res.json();
    };

    const salvarPreferencias = useMutation({
        mutationFn: (payload: { fonteId: number; extensoes: string[]; ultimaCapturaSucesso?: string | null; destinoCentral?: string | null }) =>
            fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }).then(handleResponse),
        onSuccess: () => {
            message.success('Parâmetros salvos');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => message.error(error.message),
    });

    const executarColeta = useMutation({
        mutationFn: (fonteId: number) =>
            fetch(`${API_BASE_URL}/${fonteId}/executar`, {
                method: 'POST',
            }).then(handleResponse),
        onSuccess: () => message.success('Coleta acionada'),
        onError: (error: Error) => message.error(error.message),
    });

    return {
        registros,
        isLoading,
        salvarPreferencias: salvarPreferencias.mutateAsync,
        executarColeta: executarColeta.mutateAsync,
        recarregar: refetch,
    };
};
