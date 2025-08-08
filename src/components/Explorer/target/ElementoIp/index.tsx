import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined, } from "@ant-design/icons";
import { faEthernet, faHouseLaptop, faLaptop, faLaptopCode, faNetworkWired, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";
import useElementoPorta from "../ElementoPorta";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();
  const elementoPorta = useElementoPorta();

  const selecionado = selecaoTarget?.get()

  const getIp = async (ip: IpResponse): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;

    const filhos: TreeDataNode[] = [];
    const portas = ip.portas ?? [];
    if (portas.length) {
      const filhosPorta: TreeDataNode[] = [];
      for (let i = 0; i < portas.length; i++) {
        const porta = portas[i];
        filhosPorta.push(await elementoPorta.getPorta(porta));
      }
      filhos.push({
        key: `${ip.endereco}-${ip.id}-portas}`,
        title: <div><FontAwesomeIcon icon={faEthernet} />{' '}Portas</div>,
        children: filhosPorta,
        className: "folder"
      })
    }

    return {
      key: `${ip.endereco}-${ip.id}}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "ip", id: ip.id })
      }}>
        <FontAwesomeIcon icon={faServer} />{' '}
        {ip.endereco}
      </div>,
      className: "ip " + (checked ? "checked " : ""),
      children: filhos
    }
  }

  return {
    getIp
  }
}

export default useElementoIp