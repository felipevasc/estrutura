import StoreContext from "@/store";
import { DiretorioResponse } from "@/types/DiretorioResponse";
import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { LimitadorArvore, NoCarregavel } from "../tipos";
import useElementoWhatweb from "../ElementoWhatweb";

const useElementoDiretorio = (limitar?: LimitadorArvore) => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoWhatweb = useElementoWhatweb();

  const getDiretorio = async (diretorio: DiretorioResponse, nome?: string, filhos: NoCarregavel[] = []): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "diretorio" && selecionado?.id === diretorio.id;

    const icone = diretorio.tipo === "arquivo" ? faFile : faFolder;
    const status = diretorio.status !== null && diretorio.status !== undefined ? diretorio.status : "-";
    const tamanho = diretorio.tamanho !== null && diretorio.tamanho !== undefined ? `${diretorio.tamanho}b` : "-";
    const classeTipo = diretorio.tipo === "arquivo" ? "arquivo" : "pasta";

    const pasta = elementoWhatweb.getResultados(diretorio.whatwebResultados ?? [], `diretorio-${diretorio.id}`);
    const filhosLimitados = limitar ? limitar(`diretorio-${diretorio.id}-filhos`, filhos) : filhos;
    const children: NoCarregavel[] = [...filhosLimitados];
    if (pasta) children.push(pasta);

    return {
      key: `diretorio-${diretorio.id}`,
      title: (
        <div className="item-diretorio" onClick={() => selecaoTarget?.set({ tipo: "diretorio", id: diretorio.id })}>
          <FontAwesomeIcon icon={icone} />{" "}
          <span className="nome-diretorio">{nome ?? diretorio.caminho}</span>{" "}
          <small>({status} - {tamanho})</small>
        </div>
      ),
      className: "diretorio " + classeTipo + " " + (checked ? "checked " : ""),
      children: children,
      isLeaf: children.length === 0
    };
  };

  return {
    getDiretorio
  };
};

export default useElementoDiretorio;
