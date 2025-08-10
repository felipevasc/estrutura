import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined, } from "@ant-design/icons";
import { faEthernet, faHouseLaptop, faLaptop, faLaptopCode, faNetworkWired, faServer, faUser, faShareAlt } from "@fortawesome/free-solid-svg-icons";
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

    const sambaUsers = ip.sambaUsers ?? [];
    if (sambaUsers.length) {
      const filhosUser: TreeDataNode[] = [];
      for (let i = 0; i < sambaUsers.length; i++) {
        const user = sambaUsers[i];
        filhosUser.push({
          key: `${ip.endereco}-${ip.id}-user-${user.id}`,
          title: <div><FontAwesomeIcon icon={faUser} />{' '}{user.nome}</div>,
          className: "user"
        });
      }
      filhos.push({
        key: `${ip.endereco}-${ip.id}-samba-users}`,
        title: <div><FontAwesomeIcon icon={faUser} />{' '}Samba Users</div>,
        children: filhosUser,
        className: "folder"
      })
    }

    const sambaShares = ip.sambaShares ?? [];
    if (sambaShares.length) {
      const filhosShare: TreeDataNode[] = [];
      for (let i = 0; i < sambaShares.length; i++) {
        const share = sambaShares[i];
        filhosShare.push({
          key: `${ip.endereco}-${ip.id}-share-${share.id}`,
          title: <div><FontAwesomeIcon icon={faShareAlt} />{' '}{share.nome}</div>,
          className: "share"
        });
      }
      filhos.push({
        key: `${ip.endereco}-${ip.id}-samba-shares}`,
        title: <div><FontAwesomeIcon icon={faShareAlt} />{' '}Samba Shares</div>,
        children: filhosShare,
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