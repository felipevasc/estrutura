import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse";
import { GlobalOutlined } from "@ant-design/icons";
import { faFolderOpen, faNetworkWired, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useMemo } from "react";
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

  return useMemo(() => {
    async function montarDiretorios(diretorios: NodoDiretorio[]): Promise<NoCarregavel[]> {
      const filhos = await Promise.all(diretorios.map(async nodo => {
        const filhosNodos = await montarDiretorios(nodo.filhos);
        return elementoDiretorio.getDiretorio(nodo.diretorio, nodo.nome, filhosNodos);
      }));
      return filhos;
    }

    async function montarFilhos(dominio: DominioResponse, anteriores: string[]): Promise<NoCarregavel[]> {
      const filhos: NoCarregavel[] = [];

      if ((dominio.subDominios?.length ?? 0) > 0) {
        const subdominios = dominio.subDominios ?? [];
        const grupos = new Map<string, DominioResponse[]>();
        subdominios.forEach(sub => {
          const chave = sub.tipo ?? "subdominio";
          const atual = grupos.get(chave) ?? [];
          grupos.set(chave, [...atual, sub]);
        });

        const ordem = ["principal", "dns", "alias"];
        const rotulos: Record<string, string> = { principal: "Subdomínios", dns: "DNS", alias: "Alias", subdominio: "Subdomínios" };
        const icones: Record<string, any> = { principal: faRoute, dns: faNetworkWired, alias: faFolderOpen, subdominio: faRoute };

        const chaves = [...grupos.keys()].sort((a, b) => {
          const ia = ordem.indexOf(a);
          const ib = ordem.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

        for (const chave of chaves) {
          const lista = grupos.get(chave) ?? [];
          const filhosSubdominios: NoCarregavel[] = [];
          for (let i = 0; i < lista.length; i++) {
            const subdominio = lista[i];
            filhosSubdominios.push(await getDominio(subdominio, [...anteriores, chave]));
          }
          const icone = icones[chave] ?? faRoute;
          const titulo = rotulos[chave] ?? "Subdomínios";
          filhos.push({
            key: `${dominio.endereco}-${dominio.id}-${chave}`,
            title: <div><FontAwesomeIcon icon={icone} /> {titulo}</div>,
            children: filhosSubdominios,
            className: "folder",
            isLeaf: filhosSubdominios.length === 0
          });
        }
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
    }

    async function carregarDominio(dominio: DominioResponse, anteriores: string[]) {
      const params = new URLSearchParams({ limiteFilhos: "1", limite: "0" });
      params.set("tipos", "principal,dns,alias");
      const res = await fetch(`/api/v1/dominios/${dominio.id}?${params.toString()}`);
      const data: DominioResponse = await res.json();
      return montarFilhos(data, anteriores);
    }

    async function getDominio(dominio: DominioResponse, anteriores: string[] = []): Promise<NoCarregavel> {
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
    }

    return {
      getDominio
    };
  }, [elementoDiretorio, elementoIp, elementoWhatweb, selecaoTarget, tipoSelecionado]);
};

export default useElementoDominio;
