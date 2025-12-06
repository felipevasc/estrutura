"use client"
import { DominioResponse } from "@/types/DominioResponse";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const useDns = () => {
  const getDns = useCallback((idProjeto?: number) => useQuery({
    queryKey: ["dns", idProjeto],
    queryFn: async (): Promise<DominioResponse[]> => {
      const res = await fetch("/api/v1/projetos/" + idProjeto + "/dns");
      const data = await res.json();
      return data;
    },
    enabled: !!idProjeto
  }), []);

  return useMemo(() => ({ getDns }), [getDns]);
};

export default useDns;
