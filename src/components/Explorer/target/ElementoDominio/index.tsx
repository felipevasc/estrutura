import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse";
import { GlobalOutlined } from "@ant-design/icons";
import { faFolderOpen, faNetworkWired, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import useElementoIp from "../ElementoIp";
import useElementoDiretorio from "../ElementoDiretorio";
import { LimitadorArvore, NoCarregavel } from "../tipos";
import useElementoWhatweb from "../ElementoWhatweb";
import { TargetType } from "@/types/TargetType";
import { construirArvoreDiretorios, NodoDiretorio } from "../construirArvoreDiretorios";

const useElementoDominio = (tipoSelecionado: TargetType = "domain", limitar?: LimitadorArvore) => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoIp = useElementoIp(limitar);
  const elementoDiretorio = useElementoDiretorio(limitar);
  const elementoWhatweb = useElementoWhatweb();

  const montarFilhos = async (dominio: DominioResponse, anteriores: string[]): Promise<NoCarregavel[]> => {
    const filhos: NoCarregavel[] = [];

    if ((dominio.subDominios?.length ?? 0) > 0) {
      const subdominios = dominio.subDominios ?? [];
      const filhosSubdominiosResolvidos: NoCarregavel[] = [];
      for (let i = 0; i < subdominios.length; i++) {
        const subdominio = subdominios[i];
        filhosSubdominiosResolvidos.push(await getDominio(subdominio, [...anteriores, "dominio"]));
      }
      const filhosSubdominios = limitar ? limitar(`${dominio.endereco}-${dominio.id}-subdominios-filhos`, filhosSubdominiosResolvidos) : filhosSubdominiosResolvidos;
      filhos.push({
        key: `${dominio.endereco}-${dominio.id}-subdominios`,
        title: <div><FontAwesomeIcon icon={faRoute} /> Subdomínios</div>,
        children: filhosSubdominios,
        className: "folder",
        isLeaf: filhosSubdominios.length === 0
      });
    }

    if (!anteriores.includes("ip") && (dominio.ips?.length ?? 0) > 0) {
      const ips = dominio.ips ?? [];
      const filhosIpResolvidos: NoCarregavel[] = [];
      for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];
        filhosIpResolvidos.push(await elementoIp.getIp(ip, ["dominio", ...anteriores]));
      }
      const filhosIp = limitar ? limitar(`${dominio.endereco}-${dominio.id}-ips-filhos`, filhosIpResolvidos) : filhosIpResolvidos;
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
      const filhosDiretoriosResolvidos = await montarDiretorios(diretorios);
      const filhosDiretorios = limitar ? limitar(`${dominio.endereco}-${dominio.id}-diretorios-filhos`, filhosDiretoriosResolvidos) : filhosDiretoriosResolvidos;
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

  const getDominio = async (dominio: DominioResponse, anteriores: string[] = []): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === tipoSelecionado && selecionado?.id === dominio.id;
    const possuiSubdominios = (dominio.subDominios?.length ?? 0) > 0;
    const possuiIps = !anteriores.includes("ip") && (dominio.ips?.length ?? 0) > 0;
    const possuiDiretorios = !anteriores.includes("diretorios") && (dominio.diretorios?.length ?? 0) > 0;
    const possuiWhatweb = (dominio.whatwebResultados?.length ?? 0) > 0;
    const possuiFilhos = possuiSubdominios || possuiIps || possuiDiretorios || possuiWhatweb;

    return {
      key: `${dominio.endereco}-${dominio.id}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: tipoSelecionado, id: dominio.id });
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
