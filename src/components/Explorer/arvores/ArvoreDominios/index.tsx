"use client"
import { Tree, TreeDataNode } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalOutlined, SendOutlined } from '@ant-design/icons';
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from './styles';
import NovoDominio from './NovoDominio';
import useApi from '@/api';
import StoreContext from '@/store';
import useElementoDominio from '../../target/ElementoDominio';

const ArvoreDominios = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const api = useApi();
  const { projeto, selecaoTarget } = useContext(StoreContext);
  const { data: dominiosProjeto } = api.dominios.getDominios(projeto?.get()?.id);
  const elementoDominio = useElementoDominio();
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);

  const selecionado = selecaoTarget?.get();

  useEffect(() => {
    setElementos([]);
    setExpandedKeys([]);
  }, [projeto?.get()?.id])

  useEffect(() => {
    setElementos([]);
    dominiosProjeto?.forEach((d) => {
      let checked = false;
      if (selecionado?.tipo === "domain" && selecionado?.id === d.id) {
        checked = true;
      }
      elementoDominio.getDominio(d).then(ret => {
        setElementos(elementos => [...elementos, ret]);
      })
    }
    )
  }, [dominiosProjeto])

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  return <StyledArvoreDominio>
    <StyledTitleDominio>
      dominio
      <StyledTitleDominioIcon>
        <NovoDominio />
      </StyledTitleDominioIcon>
    </StyledTitleDominio>
    <Tree
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      treeData={elementos.sort((a, b) => a.key && b.key && a.key > b?.key ? 1 : -1)}
      showIcon={true}
      showLine={true}
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}

    />
  </StyledArvoreDominio>
}

export default ArvoreDominios