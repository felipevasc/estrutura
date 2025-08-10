import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined, } from "@ant-design/icons";
import { faEthernet, faHouseLaptop, faLaptop, faLaptopCode, faNetworkWired, faServer, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";
import useElementoPorta from "../ElementoPorta";
import useElementoUsuario from "../ElementoUsuario";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();
  const elementoPorta = useElementoPorta();
  const elementoUsuario = useElementoUsuario();

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

    const usuarios = ip.usuarios ?? [];
    if (usuarios.length) {
      const filhosUsuarios: TreeDataNode[] = [];
      for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        filhosUsuarios.push(await elementoUsuario.getUsuario(usuario));
      }
      filhos.push({
        key: `${ip.endereco}-${ip.id}-usuarios}`,
        title: <div><FontAwesomeIcon icon={faUserFriends} />{' '}Usuários</div>,
        children: filhosUsuarios,
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