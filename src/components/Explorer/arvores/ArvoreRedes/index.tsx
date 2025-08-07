"use client"
import { Tree, TreeDataNode } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalOutlined, SendOutlined } from '@ant-design/icons';
import { StyledArvoreRede, StyledTitleRede, StyledTitleRedeIcon } from './styles';
import useApi from '@/api';
import StoreContext from '@/store';
import useElementoRede from '../../target/ElementoRede';

const ArvoreRedes = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const api = useApi();
  const { projeto, selecaoTarget } = useContext(StoreContext);
  const { data: redesProjeto } = api.redes.getRedes(projeto?.get()?.id);
  const elementoRede = useElementoRede();
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);

  const selecionado = selecaoTarget?.get();

  useEffect(() => {
    setElementos([]);
    setExpandedKeys([]);
  }, [projeto?.get()?.id])

  useEffect(() => {
    setElementos([]);
    redesProjeto?.forEach((r) => {
      elementoRede.getRede(r).then(ret => {
        setElementos(elementos => [...elementos, ret]);
      })
    }
    )
  }, [redesProjeto])

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const key = selectedKeys[0] as string;
    if (!key) return;

    const [tipo, id] = key.split('-');
    if (tipo === 'rede') {
      const rede = redesProjeto?.find(r => r.id === parseInt(id, 10));
      if (rede) {
        selecaoTarget?.set({ id: rede.id, tipo: "network" });
      }
    } else if (tipo === 'ip') {
        const rede = redesProjeto?.find(r => r.ips && r.ips.some(ip => ip.id === parseInt(id, 10)));
        const ip = rede?.ips && rede.ips.find(ip => ip.id === parseInt(id, 10));
        if (ip) {
            selecaoTarget?.set({ id: ip.id, tipo: "ip", endereco: ip.endereco });
        }
    }
  };

  return <StyledArvoreRede>
    <StyledTitleRede>
      Redes e IPs
    </StyledTitleRede>
    <Tree
      onExpand={onExpand}
      onSelect={onSelect}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      treeData={elementos.sort((a, b) => a.key && b.key && a.key > b?.key ? 1 : -1)}
      showIcon={true}
      showLine={true}
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}

    />
  </StyledArvoreRede>
}

export default ArvoreRedes
