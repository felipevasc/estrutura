"use client"
import { Tree, TreeDataNode } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { SendOutlined } from '@ant-design/icons';
import { StyledArvoreIp, StyledTitleIp, StyledTitleIpIcon } from './styles';
import useApi from '@/api';
import StoreContext from '@/store';
import NovoIp from './NovoIp';
import useElementoIp from '../../target/ElementoIp';

const ArvoreIps = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: ipsProjeto } = api.ips.getIps(projeto?.get()?.id);
  const elementoIp = useElementoIp();
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    setElementos([]);
    setExpandedKeys([]);
  }, [projeto?.get()?.id]);

  useEffect(() => {
    const buildTree = async () => {
      if (ipsProjeto) {
        const treeElements = await Promise.all(
          ipsProjeto.map(ip => elementoIp.getIp(ip))
        );
        setElementos(treeElements);
      }
    };
    buildTree();
  }, [ipsProjeto]);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  return (
    <StyledArvoreIp>
      <StyledTitleIp>
        IPs
        <StyledTitleIpIcon>
          <NovoIp />
        </StyledTitleIpIcon>
      </StyledTitleIp>
      <Tree
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={elementos.sort((a, b) => (a.key && b.key && a.key > b.key) ? 1 : -1)}
        showIcon={true}
        showLine={true}
        switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}
      />
    </StyledArvoreIp>
  );
};

export default ArvoreIps;
