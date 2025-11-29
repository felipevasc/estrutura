"use client"
import { IpResponse } from "@/types/IpResponse";
import { useQuery } from "@tanstack/react-query";

const useIps = () => {
    const useIp = (idIp?: number) => useQuery({
        queryKey: ["get-ip", idIp],
        queryFn: async (): Promise<IpResponse> => {
            const resposta = await fetch("/api/v1/ips/" + idIp);
            const dados = await resposta.json();
            return dados;
        },
        enabled: !!idIp
    });

    const useIpsProjeto = (idProjeto?: number) => useQuery({
        queryKey: ["get-ips-projeto", idProjeto],
        queryFn: async (): Promise<IpResponse[]> => {
            const resposta = await fetch(`/api/v1/projetos/${idProjeto}/ips`);
            const dados = await resposta.json();
            return dados;
        },
        enabled: !!idProjeto
    });

    return { useIp, useIpsProjeto };
}

export default useIps;
