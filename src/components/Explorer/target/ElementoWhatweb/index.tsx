import { faFingerprint, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import { NoCarregavel } from "../tipos";
import { Tooltip } from "antd";

const useElementoWhatweb = () => {
  const getResultados = (resultados: WhatwebResultadoResponse[], chave: string): NoCarregavel | null => {
    if (!resultados?.length) return null;

    const grupos = resultados.reduce((acc, resultado) => {
        if (!acc[resultado.plugin]) acc[resultado.plugin] = [];
        acc[resultado.plugin].push(resultado);
        return acc;
    }, {} as Record<string, WhatwebResultadoResponse[]>);

    const chavesPlugins = Object.keys(grupos).sort();

    const filhosPlugins: NoCarregavel[] = chavesPlugins.map((plugin) => {
        const itens = grupos[plugin];
        itens.sort((a, b) => a.valor.localeCompare(b.valor));

        const filhosItens: NoCarregavel[] = itens.map((item, index) => {
            const dadosFormatados = item.dados ? JSON.stringify(item.dados, null, 2) : undefined;

            return {
                key: `${chave}-whatweb-${plugin}-${index}-${item.id ?? index}`,
                title: (
                    <Tooltip title={dadosFormatados ? <pre style={{ maxHeight: '300px', overflow: 'auto', color: 'white' }}>{dadosFormatados}</pre> : null} placement="right">
                        <span>{item.valor}</span>
                    </Tooltip>
                ),
                isLeaf: true
            };
        });

        return {
            key: `${chave}-whatweb-${plugin}`,
            title: <span>{plugin}</span>,
            children: filhosItens,
            icon: <FontAwesomeIcon icon={faFolder} style={{ color: '#aaa' }} />,
            isLeaf: false
        };
    });

    return {
      key: `${chave}-whatweb`,
      title: <div><FontAwesomeIcon icon={faFingerprint} /> WhatWeb</div>,
      children: filhosPlugins,
      className: "folder",
      isLeaf: filhosPlugins.length === 0
    };
  };

  return { getResultados };
};

export default useElementoWhatweb;
