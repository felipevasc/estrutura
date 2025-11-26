
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

const API_BASE_URL = '/api/v1/cti/takedown';

// Tipagem para os dados de Takedown (pode ser movida para um arquivo de types)
export interface Takedown {
    id: number;
    url: string;
    solicitadoEm: string;
    previsao: string;
    derrubadoEm?: string;
    status: 'SOLICITADO' | 'DERRUBADO';
    ultimaVerificacao?: string;
    statusUltimaVerificacao?: 'ONLINE' | 'OFFLINE';
    metodoHttp: string;
    headers?: string;
    body?: string;
    projetoId: number;
    solicitantes: { id: number; nome: string }[];
}

export const useTakedownApi = (projetoId?: number) => {
    const queryClient = useQueryClient();

    const takedownQueryKey = ['takedowns', projetoId];

    // Buscar todos os Takedowns
    const { data: takedowns = [], isLoading, isError } = useQuery<Takedown[]>({
        queryKey: takedownQueryKey,
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}?projetoId=${projetoId}`);
            if (!response.ok) throw new Error('Falha ao buscar takedowns');
            return response.json();
        },
        enabled: !!projetoId, // A query só será executada se projetoId estiver disponível
    });

    // Buscar todos os Solicitantes
    const { data: solicitantes = [] } = useQuery<{ id: number; nome: string }[]>({
        queryKey: ['takedown_solicitantes'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/solicitantes`);
            if (!response.ok) throw new Error('Falha ao buscar solicitantes');
            return response.json();
        },
    });

    // Lógica reutilizável para tratamento de erro
    const handleApiResponse = async (res: Response) => {
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(errorData.error || 'Ocorreu um erro');
        }
        return res.json();
    };

    // Criar um novo Takedown
    const createMutation = useMutation({
        mutationFn: (newTakedown: Omit<Takedown, 'id' | 'solicitantes'> & { solicitantes: string[] }) =>
            fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTakedown),
            }).then(handleApiResponse),
        onSuccess: () => {
            message.success('Takedown adicionado com sucesso!');
            queryClient.invalidateQueries({ queryKey: takedownQueryKey });
        },
        onError: (error: Error) => message.error(error.message),
    });

    // Atualizar um Takedown existente
    const updateMutation = useMutation({
        mutationFn: (updatedTakedown: Partial<Takedown> & { id: number; solicitantes?: string[] }) =>
            fetch(`${API_BASE_URL}/${updatedTakedown.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTakedown),
            }).then(handleApiResponse),
        onSuccess: () => {
            message.success('Takedown atualizado com sucesso!');
            queryClient.invalidateQueries({ queryKey: takedownQueryKey });
        },
        onError: (error: Error) => message.error(error.message),
    });

    // Deletar um Takedown
    const deleteMutation = useMutation({
        mutationFn: (id: number) => fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            message.success('Takedown deletado com sucesso!');
            queryClient.invalidateQueries({ queryKey: takedownQueryKey });
        },
        onError: () => message.error('Erro ao deletar takedown.'),
    });

    // Enfileirar verificação de status
    const checkStatusMutation = useMutation({
        mutationFn: (ids: number[]) =>
            fetch(`${API_BASE_URL}/verificar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, projetoId }),
            }).then(res => res.json()),
        onSuccess: (data) => message.info(data.message || 'Verificação enfileirada.'),
        onError: () => message.error('Erro ao enfileirar verificação.'),
    });

    return {
        takedowns,
        solicitantes,
        isLoading,
        isError,
        createTakedown: createMutation.mutateAsync,
        updateTakedown: updateMutation.mutateAsync,
        deleteTakedown: deleteMutation.mutateAsync,
        checkTakedownStatus: checkStatusMutation.mutateAsync,
    };
};
