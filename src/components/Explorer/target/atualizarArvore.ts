import { Key } from "react";
import { NoCarregavel } from "./tipos";

export const atualizarFilhos = (lista: NoCarregavel[], chave: Key, filhos: NoCarregavel[]): NoCarregavel[] => {
  return lista.map(no => {
    if (no.key === chave) {
      return { ...no, children: filhos, isLeaf: filhos.length === 0, carregar: undefined };
    }

    if (no.children) {
      const novasCriancas = atualizarFilhos(no.children as NoCarregavel[], chave, filhos);
      if (novasCriancas !== no.children) {
        return { ...no, children: novasCriancas };
      }
    }

    return no;
  });
};
