import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse";
import { GlobalOutlined } from "@ant-design/icons";
import { faFolderOpen, faNetworkWired, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import useElementoIp from "../ElementoIp";
import useElementoDiretorio from "../ElementoDiretorio";
import { NoCarregavel } from "../tipos";
import useElementoWhatweb from "../ElementoWhatweb";
import { TargetType } from "@/types/TargetType";

const useElementoDominio = (tipoSelecionado: TargetType = "domain") => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoIp = useElementoIp();
  const elementoDiretorio = useElementoDiretorio();
  const elementoWhatweb = useElementoWhatweb();

  const montarFilhos = async (dominio: DominioResponse, anteriores: string[]): Promise<NoCarregavel[]> => {
    const filhos: NoCarregavel[] = [];

    if ((dominio.subDominios?.length ?? 0) > 0) {
      const subdominios = dominio.subDominios ?? [];
      const filhosSubdominios: NoCarregavel[] = [];
      for (let i = 0; i < subdominios.length; i++) {
        const subdominio = subdominios[i];
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
      const diretorios = dominio.diretorios ?? [];
      const filhosDiretorios: NoCarregavel[] = [];
      for (let i = 0; i < diretorios.length; i++) {
        const dir = diretorios[i];
        filhosDiretorios.push(await elementoDiretorio.getDiretorio(dir));
      }
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

  return {
    getDominio
  };
};

export default useElementoDominio;
