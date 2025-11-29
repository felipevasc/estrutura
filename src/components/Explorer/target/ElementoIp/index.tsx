import StoreContext from "@/store";
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined } from "@ant-design/icons";
import { faEthernet, faFolderOpen, faServer, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import useElementoPorta from "../ElementoPorta";
import useElementoUsuario from "../ElementoUsuario";
import useElementoDiretorio from "../ElementoDiretorio";
import { NoCarregavel } from "../tipos";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoPorta = useElementoPorta();
  const elementoDiretorio = useElementoDiretorio();
  const elementoUsuario = useElementoUsuario();

  const getIp = async (ip: IpResponse, anteriores: string[] = []): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;
    const possuiPortas = !anteriores.includes("portas") && (ip.portas?.length ?? 0) > 0;
    const possuiUsuarios = !anteriores.includes("usuarios") && (ip.usuarios?.length ?? 0) > 0;
    const possuiDominios = !anteriores.includes("dominio") && (ip.dominios?.length ?? 0) > 0;
    const possuiDiretorios = !anteriores.includes("diretorios") && (ip.diretorios?.length ?? 0) > 0;
    const possuiFilhos = possuiPortas || possuiUsuarios || possuiDominios || possuiDiretorios;

    const carregar = async () => {
      const filhos: NoCarregavel[] = [];

      if (possuiDominios) {
        const dominios = ip.dominios ?? [];
        if (dominios.length) {
          const filhosDominio: NoCarregavel[] = dominios.map(dom => ({
            key: `ip-domain-${dom.id}`,
            title: <div><GlobalOutlined /> {dom.endereco}</div>,
            isLeaf: true
          }));
          filhos.push({
            key: `${ip.endereco}-${ip.id}-dominios`,
            title: <div><GlobalOutlined /> Domínios</div>,
            children: filhosDominio,
            className: "folder",
            isLeaf: filhosDominio.length === 0
          });
        }
      }

      if (possuiPortas) {
        const portas = ip.portas ?? [];
        if (portas.length) {
          const filhosPorta: NoCarregavel[] = [];
          for (let i = 0; i < portas.length; i++) {
            const porta = portas[i];
            filhosPorta.push(await elementoPorta.getPorta(porta));
          }
          filhos.push({
            key: `${ip.endereco}-${ip.id}-portas`,
            title: <div><FontAwesomeIcon icon={faEthernet} /> Portas</div>,
            children: filhosPorta,
            className: "folder",
            isLeaf: filhosPorta.length === 0
          });
        }
      }

      if (possuiUsuarios) {
        const usuarios = ip.usuarios ?? [];
        if (usuarios.length) {
          const filhosUsuarios: NoCarregavel[] = [];
          for (let i = 0; i < usuarios.length; i++) {
            const usuario = usuarios[i];
            filhosUsuarios.push(await elementoUsuario.getUsuario(usuario));
          }
          filhos.push({
            key: `${ip.endereco}-${ip.id}-usuarios`,
            title: <div><FontAwesomeIcon icon={faUserFriends} /> Usuários</div>,
            children: filhosUsuarios,
            className: "folder",
            isLeaf: filhosUsuarios.length === 0
          });
        }
      }

      if (possuiDiretorios) {
        const diretorios = ip.diretorios ?? [];
        if (diretorios.length) {
          const filhosDiretorios: NoCarregavel[] = [];
          for (let i = 0; i < diretorios.length; i++) {
            const dir = diretorios[i];
            filhosDiretorios.push(await elementoDiretorio.getDiretorio(dir));
          }
          filhos.push({
            key: `${ip.endereco}-${ip.id}-diretorios`,
            title: <div><FontAwesomeIcon icon={faFolderOpen} /> Diretórios</div>,
            children: filhosDiretorios,
            className: "folder",
            isLeaf: filhosDiretorios.length === 0
          });
        }
      }

      return filhos;
    };

    return {
      key: `${ip.endereco}-${ip.id}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "ip", id: ip.id });
      }}>
        <FontAwesomeIcon icon={faServer} />{" "}
        {ip.endereco}
      </div>,
      className: "ip " + (checked ? "checked " : ""),
      isLeaf: !possuiFilhos,
      carregar: possuiFilhos ? carregar : undefined
    };
  };

  return {
    getIp
  };
};

export default useElementoIp;
