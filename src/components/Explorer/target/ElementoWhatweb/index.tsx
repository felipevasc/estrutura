import { faFingerprint, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import { NoCarregavel } from "../tipos";
import { Tooltip } from "antd";

const useElementoWhatweb = () => {
  const getResultados = (resultados: WhatwebResultadoResponse[], chave: string): NoCarregavel | null => {
    if (!resultados?.length) return null;

    // Group results by Plugin Name
    const grupos: Record<string, WhatwebResultadoResponse[]> = {};
    resultados.forEach((res) => {
      if (!grupos[res.plugin]) grupos[res.plugin] = [];
      grupos[res.plugin].push(res);
    });

    const filhos: NoCarregavel[] = Object.entries(grupos).map(([plugin, itens]) => {
      // If there are multiple items for the same plugin, create a folder
      if (itens.length > 1) {
        return {
          key: `${chave}-whatweb-${plugin}`,
          title: <div><FontAwesomeIcon icon={faFolder} /> {plugin} ({itens.length})</div>,
          className: "folder",
          isLeaf: false,
          children: itens.map((item, index) => ({
            key: `${chave}-whatweb-${plugin}-${item.id ?? index}`,
            title: (
              <Tooltip title={<pre className="max-h-64 overflow-auto text-xs">{JSON.stringify(item.dados, null, 2)}</pre>} placement="right">
                <div>{item.valor}</div>
              </Tooltip>
            ),
            isLeaf: true
          }))
        };
      }

      // Single item, display directly
      const item = itens[0];
      return {
        key: `${chave}-whatweb-${plugin}-${item.id}`,
        title: (
          <Tooltip title={<pre className="max-h-64 overflow-auto text-xs">{JSON.stringify(item.dados, null, 2)}</pre>} placement="right">
            <div>{plugin}: {item.valor}</div>
          </Tooltip>
        ),
        isLeaf: true
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
