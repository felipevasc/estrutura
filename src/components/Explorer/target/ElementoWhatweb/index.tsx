import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import { NoCarregavel } from "../tipos";

const useElementoWhatweb = () => {
  const getResultados = (resultados: WhatwebResultadoResponse[], chave: string): NoCarregavel | null => {
    if (!resultados?.length) return null;

    const grupos = resultados.reduce((acc, resultado) => {
      const plugin = resultado.plugin || "Outros";
      if (!acc[plugin]) acc[plugin] = [];
      acc[plugin].push(resultado);
      return acc;
    }, {} as Record<string, WhatwebResultadoResponse[]>);

    const filhos: NoCarregavel[] = Object.entries(grupos).map(([plugin, items], idx) => {
      const subFilhos: NoCarregavel[] = items.map((item, i) => ({
        key: `${chave}-whatweb-${plugin}-${i}-${item.valor}`,
        title: <div>{item.valor}</div>,
        isLeaf: true
      }));

      return {
        key: `${chave}-whatweb-${plugin}-${idx}`,
        title: <div>{plugin}</div>,
        children: subFilhos,
        className: "folder",
        isLeaf: subFilhos.length === 0
      };
    });

    return {
      key: `${chave}-whatweb`,
      title: <div><FontAwesomeIcon icon={faFingerprint} /> WhatWeb</div>,
      children: filhos,
      className: "folder",
      isLeaf: filhos.length === 0
    };
  };

  return { getResultados };
};

export default useElementoWhatweb;
