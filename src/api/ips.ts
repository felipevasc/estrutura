"use client"
import { IpResponse } from "@/types/IpResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useIps = () => {
    const queryClient = useQueryClient();

    const getIp = async (idIp?: number): Promise<IpResponse> => {
        const res = await fetch("/api/v1/ips/" + idIp);
        const data = await res.json();
        return data;
    }

    const getIps = (idProjeto?: number) => useQuery({
        queryKey: ["get-ips", idProjeto],
        queryFn: async (): Promise<IpResponse[]> => {
            const res = await fetch(`/api/v1/projetos/${idProjeto}/ips`);
            const data = await res.json();
            return data;
        },
        enabled: !!idProjeto
    });

    const postIp = useMutation({
        mutationFn: async (ip: { endereco: string, projetoId: number }): Promise<IpResponse> => {
            const res = await fetch("/api/v1/ips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ip),
            });
            const data = await res.json();
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-ips"] });
        }
    });

    return { getIp, getIps, postIp };
}

export default useIps;
