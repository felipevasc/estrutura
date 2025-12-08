"use client"
import { IpResponse } from "@/types/IpResponse";
import { useQuery } from "@tanstack/react-query";

const useIp = (idIp?: number) => useQuery({
    queryKey: ["get-ip", idIp],
    queryFn: async (): Promise<IpResponse> => {
        const res = await fetch("/api/v1/ips/" + idIp);
        const data = await res.json();
        return data;
    },
    enabled: !!idIp
});

const useIpsProjeto = (idProjeto?: number) => useQuery({
    queryKey: ["get-ips-projeto", idProjeto],
    queryFn: async (): Promise<IpResponse[]> => {
        const res = await fetch(`/api/v1/projetos/${idProjeto}/ips`);
        const data = await res.json();
        return data;
    },
    enabled: !!idProjeto
});

const useIps = () => ({ getIp: useIp, getIps: useIpsProjeto });

export default useIps;
