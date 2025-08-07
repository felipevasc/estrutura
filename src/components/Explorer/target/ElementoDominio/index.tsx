import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { GlobalOutlined, DeploymentUnitOutlined } from "@ant-design/icons";
import { faNetworkWired, faPlug, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";
import useElementoIp from "../ElementoIp";

type ElementoDominioProps = {
  dominio: DominioResponse;
}

const useElementoDominio = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();
  const elementoIp = useElementoIp();

  const selecionado = selecaoTarget?.get()

  const getDominio = async (dominio: DominioResponse): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "domain" && selecionado?.id === dominio.id;
    
    const filhos: TreeDataNode[] = [];
    
    const subdominios = dominio.subDominios ?? []; 
    if (subdominios.length) {
      const filhosSubdominios: TreeDataNode[] = [];
      for (let i = 0; i < subdominios.length; i++) {
        const subdominio = subdominios[i];
        filhosSubdominios.push(await getDominio(subdominio));
      }
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}-subdominios}`,
        title: <div><FontAwesomeIcon icon={faRoute} />{' '}Subdominios</div>,
        children: filhosSubdominios,
        className: "folder"
      })
    }

    const ips = dominio.ips ?? []; 
    if (ips.length) {
      const filhosIp: TreeDataNode[] = [];
      for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];
        //filhosIp.push(await elementoIp.getIp(ip));
      }
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}}-ips`,
        title: <div><FontAwesomeIcon icon={faNetworkWired} />{' '}IPs</div>,
        children: filhosIp,
        className: "folder"
      })
    }


    return {
      key: `${dominio.endereco}-${dominio.id}}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "domain", id: dominio.id })
      }}>
        <GlobalOutlined />{' '}
        {dominio.endereco}
      </div>,
      className: "dominio " + (checked ? "checked " : ""),
      children: filhos
    }
  }

  return {
    getDominio
  }
}

export default useElementoDominio