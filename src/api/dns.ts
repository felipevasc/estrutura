"use client"
import { DominioResponse } from "@/types/DominioResponse";
import { useQuery } from "@tanstack/react-query";

const useDnsProjeto = (idProjeto?: number) => useQuery({
  queryKey: ["dns", idProjeto],
  queryFn: async (): Promise<DominioResponse[]> => {
    const res = await fetch(`/api/v1/projetos/${idProjeto}/dns?limite=1&limiteFilhos=1`);
    const data = await res.json();
    return data;
  },
  enabled: !!idProjeto
});

const useDns = () => ({ getDns: useDnsProjeto });

export default useDns;
