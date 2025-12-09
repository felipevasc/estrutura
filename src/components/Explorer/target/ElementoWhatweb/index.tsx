import { faBoxes, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import { NoCarregavel } from "../tipos";
import { Tooltip } from "antd";
import { useCallback, useMemo } from "react";

const useElementoWhatweb = () => {
  const getResultados = useCallback((resultados: WhatwebResultadoResponse[], chave: string): NoCarregavel | null => {
    if (!resultados?.length) return null;

    const grupos: Record<string, WhatwebResultadoResponse[]> = {};
    resultados.forEach(res => {
      if (!grupos[res.plugin]) grupos[res.plugin] = [];
      grupos[res.plugin].push(res);
    });

    const filhos: NoCarregavel[] = Object.entries(grupos).map(([plugin, itens]) => {
      if (itens.length > 1) {
        return {
          key: `${chave}-outros-${plugin}`,
          title: <div><FontAwesomeIcon icon={faFolder} /> {plugin} ({itens.length})</div>,
          className: "folder",
          isLeaf: false,
          children: itens.map((item, index) => ({
            key: `${chave}-outros-${plugin}-${item.id ?? index}`,
            title: (
              <Tooltip title={<pre className="max-h-64 overflow-auto text-xs">{JSON.stringify(item.dados, null, 2)}</pre>} placement="right">
                <div>{item.valor}</div>
              </Tooltip>
            ),
            isLeaf: true
          }))
        };
      }

      const item = itens[0];
      return {
        key: `${chave}-outros-${plugin}-${item.id}`,
        title: (
          <Tooltip title={<pre className="max-h-64 overflow-auto text-xs">{JSON.stringify(item.dados, null, 2)}</pre>} placement="right">
            <div>{plugin}: {item.valor}</div>
          </Tooltip>
        ),
        isLeaf: true
      };
    });

    return {
      key: `${chave}-outros`,
      title: <div><FontAwesomeIcon icon={faBoxes} /> Outros</div>,
      children: filhos,
      className: "folder",
      isLeaf: filhos.length === 0
    };
  }, []);

  return useMemo(() => ({ getResultados }), [getResultados]);
};

export default useElementoWhatweb;
