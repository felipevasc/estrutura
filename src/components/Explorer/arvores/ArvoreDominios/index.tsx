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
    let active = true;
    setElementos([]);

    if (dominiosProjeto) {
      dominiosProjeto.forEach((d) => {
        elementoDominio.getDominio(d).then(ret => {
          if (active) {
            setElementos(elementos => [...elementos, ret]);
          }
        })
      })
    }
    return () => {
      active = false;
    }
  }, [dominiosProjeto])

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const sortedElementos = useMemo(() => {
    return [...elementos].sort((a, b) => a.key && b.key && a.key > b?.key ? 1 : -1)
  }, [elementos])

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
      treeData={sortedElementos}
      showIcon={true}
      showLine={true}
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}

    />
  </StyledArvoreDominio>
}

export default ArvoreDominios