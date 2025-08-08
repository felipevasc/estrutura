"use client"
import { PortResponse } from "@/types/PortResponse";
import { useQuery } from "@tanstack/react-query";

const usePortas = () => {
  const getPorta = (idPorta?: number) => useQuery({
    queryKey: ["get-porta", idPorta],
    queryFn: async (): Promise<PortResponse> => {
      const res = await fetch("/api/v1/portas/" + idPorta);
      const data = await res.json();
      return data;
    },
    enabled: !!idPorta
  });

  return { getPorta };
};

export default usePortas;

