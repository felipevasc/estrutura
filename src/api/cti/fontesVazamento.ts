import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

export type TipoFonteVazamento = 'TELEGRAM' | 'FORUM_SURFACE' | 'FORUM_DARKWEB';

export interface FonteVazamento {
    id: number;
    nome: string;
    tipo: TipoFonteVazamento;
    parametros: Record<string, unknown>;
    observacoes?: string | null;
    projetoId?: number | null;
    criadoEm: string;
    atualizadoEm: string;
}

const API_BASE_URL = '/api/v1/cti/vazamento/fontes';

export const useFontesVazamento = (projetoId?: number) => {
    const queryClient = useQueryClient();
    const queryKey = ['fontes_vazamento', projetoId];

    const { data: fontes = [], isLoading, refetch } = useQuery<FonteVazamento[]>({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (projetoId) params.append('projetoId', `${projetoId}`);
            const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
            if (!response.ok) throw new Error('Erro ao listar fontes');
            return response.json();
        },
        enabled: true,
    });

    const handleResponse = async (res: Response) => {
        if (!res.ok) {
            const payload = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(payload.error || 'Erro ao processar solicitação');
        }
        return res.json();
    };

    const criarFonte = useMutation({
        mutationFn: (fonte: Omit<FonteVazamento, 'id' | 'criadoEm' | 'atualizadoEm'>) =>
            fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fonte),
            }).then(handleResponse),
        onSuccess: () => {
            message.success('Fonte cadastrada com sucesso');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => message.error(error.message),
    });

    const atualizarFonte = useMutation({
        mutationFn: (fonte: Partial<FonteVazamento> & { id: number }) =>
            fetch(`${API_BASE_URL}/${fonte.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fonte),
            }).then(handleResponse),
        onSuccess: () => {
            message.success('Fonte atualizada com sucesso');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => message.error(error.message),
    });

    const removerFonte = useMutation({
        mutationFn: (id: number) => fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' }).then(handleResponse),
        onSuccess: () => {
            message.success('Fonte removida');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => message.error(error.message),
    });

    return {
        fontes,
        isLoading,
        criarFonte: criarFonte.mutateAsync,
        atualizarFonte: atualizarFonte.mutateAsync,
        removerFonte: removerFonte.mutateAsync,
        recarregarFontes: refetch,
    };
};
