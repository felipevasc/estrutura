import { Button } from "antd";
import { useCallback, useState } from "react";
import { LimitadorArvore } from "./tipos";

const passo = 20;

const useLimiteArvore = () => {
  const [limites, setLimites] = useState<Record<string, number>>({});

  const carregarMais = useCallback((chave: string, total: number) => {
    setLimites(atual => {
      const limiteAtual = atual[chave] ?? passo;
      if (limiteAtual >= total) return atual;
      return { ...atual, [chave]: Math.min(limiteAtual + passo, total) };
    });
  }, []);

  const limitar: LimitadorArvore = useCallback((chave, lista) => {
    const limite = limites[chave] ?? passo;
    const visiveis = lista.slice(0, limite);
    if (lista.length > limite) {
      visiveis.push({
        key: `${chave}-mais`,
        title: <Button type="link" onClick={() => carregarMais(chave, lista.length)}>(. . .)</Button>,
        className: "carregar-mais",
        selectable: false,
        isLeaf: true
      });
    }
    return visiveis;
  }, [carregarMais, limites]);

  const resetar = useCallback(() => setLimites({}), []);

  return { limitar, resetar };
};

export default useLimiteArvore;
