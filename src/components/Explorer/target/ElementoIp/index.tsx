import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined } from "@ant-design/icons";
import { faEthernet, faHouseLaptop, faLaptop, faLaptopCode, faNetworkWired, faServer, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";
import useElementoPorta from "../ElementoPorta";
import useElementoUsuario from "../ElementoUsuario";
import useElementoDiretorio from "../ElementoDiretorio";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();
  const elementoPorta = useElementoPorta();
  const elementoDiretorio = useElementoDiretorio();

  const selecionado = selecaoTarget?.get()

  const getIp = async (ip: IpResponse, skipChildrenTypes: string[] = []): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;

    const filhos: TreeDataNode[] = [];

    // Dominios
    if (!skipChildrenTypes.includes('dominios')) {
        const dominios = ip.dominios ?? [];
        if (dominios.length) {
            const filhosDominio: TreeDataNode[] = [];
            for (let i = 0; i < dominios.length; i++) {
                const dom = dominios[i];
                filhosDominio.push({
                    key: `ip-domain-${dom.id}`,
                    title: <div><GlobalOutlined /> {dom.endereco}</div>,
                    isLeaf: true
                });
            }
            filhos.push({
                key: `${ip.endereco}-${ip.id}-dominios`,
                title: <div><GlobalOutlined />{' '}Domínios</div>,
                children: filhosDominio,
                className: "folder"
            });
        }
    }

    if (!skipChildrenTypes.includes('portas')) {
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
    }

    if (!skipChildrenTypes.includes('usuarios')) {
        const usuarios = ip.usuarios ?? [];
        if (usuarios.length) {
        const filhosUsuarios: TreeDataNode[] = [];
        for (let i = 0; i < usuarios.length; i++) {
            const usuario = usuarios[i];
             filhosUsuarios.push({
                key: `ip-user-${usuario.id}`,
                title: <div><FontAwesomeIcon icon={faUserFriends} /> {usuario.nome}</div>,
             });
        }
        filhos.push({
            key: `${ip.endereco}-${ip.id}-usuarios}`,
            title: <div><FontAwesomeIcon icon={faUserFriends} />{' '}Usuários</div>,
            children: filhosUsuarios,
            className: "folder"
        })
        }
    }

    if (!skipChildrenTypes.includes('diretorios')) {
        const diretorios = ip.diretorios ?? [];
        if (diretorios.length) {
        const filhosDiretorios: TreeDataNode[] = [];
        for (let i = 0; i < diretorios.length; i++) {
            const dir = diretorios[i];
            filhosDiretorios.push(await elementoDiretorio.getDiretorio(dir));
        }
        filhos.push({
            key: `${ip.endereco}-${ip.id}-diretorios`,
            title: <div><FontAwesomeIcon icon={faFolderOpen} />{' '}Diretórios</div>,
            children: filhosDiretorios,
            className: "folder"
        })
        }
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
