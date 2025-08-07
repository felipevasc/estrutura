import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined,  } from "@ant-design/icons";
import { faHouseLaptop, faLaptop, faLaptopCode, faNetworkWired, faPlug, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();

  const selecionado = selecaoTarget?.get()

  const getIp = async (ip: IpResponse): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;
    const filhos: TreeDataNode[] = [];

    // Fetch full details to get ports
    const ipDetails = await api.ips.getIpDetails(ip.id);
    const portas = ipDetails?.portas ?? [];

    if (portas.length > 0) {
      const filhosPorta: TreeDataNode[] = portas.map((porta: any) => ({
        key: `porta-${porta.id}`,
        title: <div onClick={() => selecaoTarget?.set({ tipo: "port", id: porta.id })}>
          <FontAwesomeIcon icon={faPlug} />{' '}
          {porta.numero}/{porta.protocolo} - {porta.servico}
        </div>,
        className: "porta " + (selecionado?.tipo === "port" && selecionado?.id === porta.id ? "checked" : ""),
        isLeaf: true,
      }));

      filhos.push({
        key: `ip-${ip.id}-portas`,
        title: <div><FontAwesomeIcon icon={faLaptopCode} />{' '}Portas</div>,
        children: filhosPorta,
        className: "folder"
      });
    }
    
    return {
      key: `ip-${ip.id}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "ip", id: ip.id })
      }}>
        <FontAwesomeIcon icon={faServer} />{' '}
        {ip.endereco}
      </div>,
      className: "ip " + (checked ? "checked" : ""),
      children: filhos
    }
  }

  return {
    getIp
  }
}

export default useElementoIp