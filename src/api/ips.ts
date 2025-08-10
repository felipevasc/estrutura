"use client"
import { IpResponse } from "@/types/IpResponse";
import { SambaInfoResponse } from "@/types/SambaInfoResponse";
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

    const getSambaInfo = async (idIp: string): Promise<SambaInfoResponse> => {
        const res = await fetch(`/api/v1/ips/${idIp}/samba`);
        const data = await res.json();
        return data;
    }

    return { getIp, getSambaInfo };
}

export default useIps;
