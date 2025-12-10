import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse";
import { GlobalOutlined } from "@ant-design/icons";
import { faEnvelope, faFolderOpen, faNetworkWired, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import useElementoIp from "../ElementoIp";
import useElementoDiretorio from "../ElementoDiretorio";
import { NoCarregavel } from "../tipos";
import useElementoWhatweb from "../ElementoWhatweb";
import { TargetType } from "@/types/TargetType";
import { construirArvoreDiretorios, NodoDiretorio } from "../construirArvoreDiretorios";

const useElementoDominio = (tipoSelecionado: TargetType = "domain") => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoIp = useElementoIp();
  const elementoDiretorio = useElementoDiretorio();
  const elementoWhatweb = useElementoWhatweb();

  const montarFilhos = async (dominio: DominioResponse, anteriores: string[]): Promise<NoCarregavel[]> => {
    const filhos: NoCarregavel[] = [];

    const subdominios = dominio.subDominios ?? [];
    const subdominiosPrincipais = subdominios.filter(s => s.tipo !== "dns" && s.tipo !== "mail");
    const subdominiosDns = subdominios.filter(s => s.tipo === "dns");
    const subdominiosMail = subdominios.filter(s => s.tipo === "mail");

    if (subdominiosPrincipais.length > 0) {
      const filhosSubdominios: NoCarregavel[] = [];
      for (let i = 0; i < subdominiosPrincipais.length; i++) {
        const subdominio = subdominiosPrincipais[i];
        filhosSubdominios.push(await getDominio(subdominio, [...anteriores, "dominio"]));
      }
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}-subdominios`,
        title: <div><FontAwesomeIcon icon={faRoute} /> Subdomínios</div>,
        children: filhosSubdominios,
        className: "folder",
        isLeaf: filhosSubdominios.length === 0
      });
    }

    if (subdominiosDns.length > 0) {
      const filhosDns: NoCarregavel[] = [];
      for (let i = 0; i < subdominiosDns.length; i++) {
        const subdominio = subdominiosDns[i];
        filhosDns.push(await getDominio(subdominio, [...anteriores, "dns"], "dns"));
      }
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}-dns`,
        title: <div><FontAwesomeIcon icon={faNetworkWired} /> DNS</div>,
        children: filhosDns,
        className: "folder",
        isLeaf: filhosDns.length === 0
      });
    }

    if (subdominiosMail.length > 0) {
      const filhosMail: NoCarregavel[] = [];
      for (let i = 0; i < subdominiosMail.length; i++) {
        const subdominio = subdominiosMail[i];
        filhosMail.push(await getDominio(subdominio, [...anteriores, "mail"], "mail"));
      }
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}-mail`,
        title: <div><FontAwesomeIcon icon={faEnvelope} /> Mail</div>,
        children: filhosMail,
        className: "folder",
        isLeaf: filhosMail.length === 0
      });
    }

    if (!anteriores.includes("ip") && (dominio.ips?.length ?? 0) > 0) {
      const ips = dominio.ips ?? [];
      const filhosIp: NoCarregavel[] = [];
      for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];
        filhosIp.push(await elementoIp.getIp(ip, ["dominio", ...anteriores]));
      }
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}-ips`,
        title: <div><FontAwesomeIcon icon={faNetworkWired} /> IPs</div>,
        children: filhosIp,
        className: "folder",
        isLeaf: filhosIp.length === 0
      });
    }

    if (!anteriores.includes("diretorios") && (dominio.diretorios?.length ?? 0) > 0) {
      const diretorios = construirArvoreDiretorios(dominio.diretorios ?? []);
      const filhosDiretorios = await montarDiretorios(diretorios);
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}-diretorios`,
        title: <div><FontAwesomeIcon icon={faFolderOpen} /> Diretórios</div>,
        children: filhosDiretorios,
        className: "folder",
        isLeaf: filhosDiretorios.length === 0
      });
    }

    if ((dominio.whatwebResultados?.length ?? 0) > 0) {
      const pasta = elementoWhatweb.getResultados(dominio.whatwebResultados ?? [], `${dominio.endereco}-${dominio.id}`);
      if (pasta) filhos.push(pasta);
    }

    return filhos;
  };

  const carregarDominio = async (dominio: DominioResponse, anteriores: string[]) => {
    const params = new URLSearchParams({ limiteFilhos: "1", limite: "0" });
    const res = await fetch(`/api/v1/dominios/${dominio.id}?${params.toString()}`);
    const data: DominioResponse = await res.json();
    return montarFilhos(data, anteriores);
  };

  const getDominio = async (dominio: DominioResponse, anteriores: string[] = [], tipo?: TargetType): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const alvoTipo = tipo ?? tipoSelecionado;
    const checked = selecionado?.tipo === alvoTipo && selecionado?.id === dominio.id;
    const subdominios = dominio.subDominios ?? [];
    const possuiSubdominios = subdominios.some(s => s.tipo !== "dns" && s.tipo !== "mail");
    const possuiDns = subdominios.some(s => s.tipo === "dns");
    const possuiMail = subdominios.some(s => s.tipo === "mail");
    const possuiIps = !anteriores.includes("ip") && (dominio.ips?.length ?? 0) > 0;
    const possuiDiretorios = !anteriores.includes("diretorios") && (dominio.diretorios?.length ?? 0) > 0;
    const possuiWhatweb = (dominio.whatwebResultados?.length ?? 0) > 0;
    const possuiFilhos = possuiSubdominios || possuiDns || possuiMail || possuiIps || possuiDiretorios || possuiWhatweb;

    return {
      key: `${dominio.endereco}-${dominio.id}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: alvoTipo, id: dominio.id });
      }}>
        <GlobalOutlined /> {dominio.endereco}
      </div>,
      className: "dominio " + (checked ? "checked " : ""),
      isLeaf: !possuiFilhos,
      carregar: possuiFilhos ? () => carregarDominio(dominio, anteriores) : undefined
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
    getDominio
  };
};

export default useElementoDominio;
