import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import { NoCarregavel } from "../tipos";

const useElementoWhatweb = () => {
  const getResultados = (resultados: WhatwebResultadoResponse[], chave: string): NoCarregavel | null => {
    if (!resultados?.length) return null;

    const filhos: NoCarregavel[] = resultados.map((resultado, indice) => ({
      key: `${chave}-whatweb-${resultado.id ?? indice}-${resultado.plugin}-${resultado.valor}`,
      title: <div>{resultado.plugin}: {resultado.valor}</div>,
      isLeaf: true
    }));

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
