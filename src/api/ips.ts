"use client"
import { IpResponse } from "@/types/IpResponse";
import { useQuery } from "@tanstack/react-query";

const useIps = () => {

    const getIp = (idIp?: number) => useQuery({
        queryKey: ["get-ip", idIp],
        queryFn: async (): Promise<IpResponse> => {
            const res = await fetch("/api/v1/ips/" + idIp);
            const data = await res.json();
            return data;
        },
        enabled: !!idIp
    });

    return { getIp };
}

export default useIps;
