import StoreContext from "@/store";
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined } from "@ant-design/icons";
import { faEthernet, faFolderOpen, faServer, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import useElementoPorta from "../ElementoPorta";
import useElementoUsuario from "../ElementoUsuario";
import useElementoDiretorio from "../ElementoDiretorio";
import { LimitadorArvore, NoCarregavel } from "../tipos";
import useElementoWhatweb from "../ElementoWhatweb";
import { construirArvoreDiretorios, NodoDiretorio } from "../construirArvoreDiretorios";

const useElementoIp = (limitar?: LimitadorArvore) => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoPorta = useElementoPorta();
  const elementoDiretorio = useElementoDiretorio(limitar);
  const elementoUsuario = useElementoUsuario();
  const elementoWhatweb = useElementoWhatweb();

  const montarFilhos = async (ip: IpResponse, anteriores: string[]): Promise<NoCarregavel[]> => {
    const filhos: NoCarregavel[] = [];

    if (!anteriores.includes("dominio") && (ip.dominios?.length ?? 0) > 0) {
      const dominios = ip.dominios ?? [];
      if (dominios.length) {
        const filhosDominio: NoCarregavel[] = limitar ? limitar(`${ip.endereco}-${ip.id}-dominios-filhos`, dominios.map(dom => ({
          key: `ip-domain-${dom.id}`,
          title: <div><GlobalOutlined /> {dom.endereco}</div>,
          isLeaf: true
        }))) : dominios.map(dom => ({
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

    if (!anteriores.includes("portas") && (ip.portas?.length ?? 0) > 0) {
      const portas = ip.portas ?? [];
      if (portas.length) {
        const filhosPortaResolvidos: NoCarregavel[] = [];
        for (let i = 0; i < portas.length; i++) {
          const porta = portas[i];
          filhosPortaResolvidos.push(await elementoPorta.getPorta(porta));
        }
        const filhosPorta = limitar ? limitar(`${ip.endereco}-${ip.id}-portas-filhos`, filhosPortaResolvidos) : filhosPortaResolvidos;
        filhos.push({
          key: `${ip.endereco}-${ip.id}-portas`,
          title: <div><FontAwesomeIcon icon={faEthernet} /> Portas</div>,
          children: filhosPorta,
          className: "folder",
          isLeaf: filhosPorta.length === 0
        });
      }
    }

    if (!anteriores.includes("usuarios") && (ip.usuarios?.length ?? 0) > 0) {
      const usuarios = ip.usuarios ?? [];
      if (usuarios.length) {
        const filhosUsuariosResolvidos: NoCarregavel[] = [];
        for (let i = 0; i < usuarios.length; i++) {
          const usuario = usuarios[i];
          filhosUsuariosResolvidos.push(await elementoUsuario.getUsuario(usuario));
        }
        const filhosUsuarios = limitar ? limitar(`${ip.endereco}-${ip.id}-usuarios-filhos`, filhosUsuariosResolvidos) : filhosUsuariosResolvidos;
        filhos.push({
          key: `${ip.endereco}-${ip.id}-usuarios`,
          title: <div><FontAwesomeIcon icon={faUserFriends} /> Usuários</div>,
          children: filhosUsuarios,
          className: "folder",
          isLeaf: filhosUsuarios.length === 0
        });
      }
    }

    if (!anteriores.includes("diretorios") && (ip.diretorios?.length ?? 0) > 0) {
      const diretorios = construirArvoreDiretorios(ip.diretorios ?? []);
      if (diretorios.length) {
        const filhosDiretorios = await montarDiretorios(diretorios);
        const filhosDiretoriosLimitados = limitar ? limitar(`${ip.endereco}-${ip.id}-diretorios-filhos`, filhosDiretorios) : filhosDiretorios;
        filhos.push({
          key: `${ip.endereco}-${ip.id}-diretorios`,
          title: <div><FontAwesomeIcon icon={faFolderOpen} /> Diretórios</div>,
          children: filhosDiretoriosLimitados,
          className: "folder",
          isLeaf: filhosDiretoriosLimitados.length === 0
        });
      }
    }

    if ((ip.whatwebResultados?.length ?? 0) > 0) {
      const pasta = elementoWhatweb.getResultados(ip.whatwebResultados ?? [], `${ip.endereco}-${ip.id}`);
      if (pasta) filhos.push(pasta);
    }

    return filhos;
  };

  const carregarIp = async (ip: IpResponse, anteriores: string[]) => {
    const params = new URLSearchParams({ limiteFilhos: "1", limite: "0" });
    const res = await fetch(`/api/v1/ips/${ip.id}?${params.toString()}`);
    const data: IpResponse = await res.json();
    return montarFilhos(data, anteriores);
  };

  const getIp = async (ip: IpResponse, anteriores: string[] = []): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;
    const possuiPortas = !anteriores.includes("portas") && (ip.portas?.length ?? 0) > 0;
    const possuiUsuarios = !anteriores.includes("usuarios") && (ip.usuarios?.length ?? 0) > 0;
    const possuiDominios = !anteriores.includes("dominio") && (ip.dominios?.length ?? 0) > 0;
    const possuiDiretorios = !anteriores.includes("diretorios") && (ip.diretorios?.length ?? 0) > 0;
    const possuiWhatweb = (ip.whatwebResultados?.length ?? 0) > 0;
    const possuiFilhos = possuiPortas || possuiUsuarios || possuiDominios || possuiDiretorios || possuiWhatweb;

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
      carregar: possuiFilhos ? () => carregarIp(ip, anteriores) : undefined
    };
  };

  const montarDiretorios = async (diretorios: NodoDiretorio[]): Promise<NoCarregavel[]> => {
    const filhos = await Promise.all(diretorios.map(async (nodo) => {
      const filhosNodos = await montarDiretorios(nodo.filhos);
      return elementoDiretorio.getDiretorio(nodo.diretorio, nodo.nome, filhosNodos);
    }));

    return filhos;
  };

  return {
    getIp
  };
};

export default useElementoIp;
