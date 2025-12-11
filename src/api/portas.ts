"use client"
import { useQuery } from "@tanstack/react-query";
import { PortaResponse } from "@/types/PortaResponse";

const usePorta = (id?: number) => useQuery({
    queryKey: ["porta", id],
    queryFn: async (): Promise<PortaResponse> => {
        const res = await fetch(`/api/v1/portas/${id}`);
        const data = await res.json();
        return data;
    },
    enabled: !!id
});

const usePortas = () => ({ usePorta });

export default usePortas;
