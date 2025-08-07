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

    const getIpDetails = async (idIp?: number): Promise<any> => {
        if (!idIp) return null;
        const res = await fetch(`/api/v1/ips/details/${idIp}`);
        if (!res.ok) {
            throw new Error('Failed to fetch IP details');
        }
        return await res.json();
    };

    return { getIp, getIpDetails };
}

export default useIps;
