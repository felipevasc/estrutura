import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RedeResponse } from '@/types/RedeResponse';
import { RedeRequest } from '@/types/RedeRequest';

const API_URL = '/api/v1/redes';

const useRedesApi = () => {
    const queryClient = useQueryClient();

    const useGetRedes = (idProjeto?: number) => {
        return useQuery({
            queryKey: ['redes', idProjeto],
            queryFn: async (): Promise<RedeResponse[]> => {
                if (!idProjeto) return [];
                const response = await fetch(`${API_URL}?idProjeto=${idProjeto}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            },
            enabled: !!idProjeto,
        });
    };

    const useGetRede = (id?: number) => {
        return useQuery({
            queryKey: ['rede', id],
            queryFn: async (): Promise<RedeResponse> => {
                if (!id) throw new Error("id is required");
                const response = await fetch(`${API_URL}/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            },
            enabled: !!id,
        });
    };

    const useCreateRede = () => {
        return useMutation({
            mutationFn: async (rede: RedeRequest): Promise<RedeResponse> => {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(rede),
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['redes'] });
            },
        });
    };

    return {
        getRedes: useGetRedes,
        getRede: useGetRede,
        createRede: useCreateRede,
    };
};

export default useRedesApi;
