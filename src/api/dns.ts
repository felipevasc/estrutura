"use client"
import { DominioResponse } from "@/types/DominioResponse";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const montarQuery = (limiteFilhos?: number, limitarDiretos = true) => {
  const params = new URLSearchParams();
  if (limiteFilhos !== undefined) params.set("limiteFilhos", String(limiteFilhos));
  if (!limitarDiretos) params.set("limitarDiretos", "false");
  const texto = params.toString();
  return texto ? `?${texto}` : "";
};

const useDns = () => {
  const getDns = useCallback((idProjeto?: number, limiteFilhos?: number, limitarDiretos = true) => useQuery({
    queryKey: ["dns", idProjeto, limiteFilhos, limitarDiretos],
    queryFn: async (): Promise<DominioResponse[]> => {
      const res = await fetch(`/api/v1/projetos/${idProjeto}/dns${montarQuery(limiteFilhos, limitarDiretos)}`);
      const data = await res.json();
      return data;
    },
    enabled: !!idProjeto
  }), []);

  return useMemo(() => ({ getDns }), [getDns]);
};

export default useDns;
