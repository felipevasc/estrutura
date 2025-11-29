"use client"
import { DiretorioResponse } from "@/types/DiretorioResponse";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useDiretorios = () => {
  const getDiretorio = (id?: number) => useQuery({
    queryKey: ["diretorio", id],
    queryFn: async (): Promise<DiretorioResponse | null> => {
      const res = await fetch(`/api/v1/diretorios/${id}`);
      const data = await res.json();
      return data;
    },
    enabled: !!id
  });

  return useMemo(() => ({ getDiretorio }), [getDiretorio]);
};

export default useDiretorios;
