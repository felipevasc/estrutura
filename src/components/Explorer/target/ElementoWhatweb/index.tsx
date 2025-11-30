import { TreeDataNode } from "antd";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import { AppstoreOutlined, LinkOutlined, TagOutlined, ToolOutlined, ConsoleSqlOutlined, GlobalOutlined, CloudServerOutlined, SecurityScanOutlined } from "@ant-design/icons";
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { NoCarregavel } from "../tipos";

const useElementoWhatweb = () => {

  const mapearPluginParaIcone = (plugin: string) => {
    const normalizado = plugin.toLowerCase();
    if (normalizado.includes('server') || normalizado.includes('os') || normalizado.includes('linux') || normalizado.includes('windows')) return <CloudServerOutlined style={{ color: '#1890ff' }} />;
    if (normalizado.includes('cms') || normalizado.includes('framework') || normalizado.includes('wordpress')) return <ToolOutlined style={{ color: '#52c41a' }} />;
    if (normalizado.includes('header')) return <TagOutlined style={{ color: '#faad14' }} />;
    if (normalizado.includes('sql') || normalizado.includes('database')) return <ConsoleSqlOutlined style={{ color: '#f5222d' }} />;
    if (normalizado.includes('waf') || normalizado.includes('security')) return <SecurityScanOutlined style={{ color: '#722ed1' }} />;
    if (normalizado.includes('country') || normalizado.includes('ip')) return <GlobalOutlined style={{ color: '#13c2c2' }} />;
    return <LinkOutlined style={{ color: '#8c8c8c' }} />;
  };

  const getResultados = (resultados: WhatwebResultadoResponse[], chave: string): NoCarregavel | null => {
    if (!resultados?.length) return null;

    // Agrupar por plugin
    const agrupados = resultados.reduce((acc, resultado) => {
      if (!acc[resultado.plugin]) acc[resultado.plugin] = [];
      acc[resultado.plugin].push(resultado);
      return acc;
    }, {} as Record<string, WhatwebResultadoResponse[]>);

    const filhos: NoCarregavel[] = Object.entries(agrupados).map(([plugin, items], indice) => ({
      key: `${chave}-whatweb-${plugin}-${indice}`,
      title: (
        <span>
            {items.length > 1 ? `${plugin} (${items.length})` : `${plugin}: ${items[0].valor}`}
        </span>
      ),
      icon: mapearPluginParaIcone(plugin),
      isLeaf: items.length === 1,
      children: items.length > 1 ? items.map((item, i) => ({
        title: item.valor,
        key: `${chave}-whatweb-${plugin}-${indice}-${i}`,
        isLeaf: true,
        icon: <TagOutlined />
      })) : []
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
