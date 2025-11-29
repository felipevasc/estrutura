import StoreContext from "@/store";
import { DiretorioResponse } from "@/types/DiretorioResponse";
import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { NoCarregavel } from "../tipos";

const useElementoDiretorio = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const getDiretorio = async (diretorio: DiretorioResponse): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "diretorio" && selecionado?.id === diretorio.id;

    const icone = diretorio.tipo === "arquivo" ? faFile : faFolder;
    const tipo = diretorio.tipo === "arquivo" ? "Arquivo" : "Diretório";
    const status = diretorio.status !== null && diretorio.status !== undefined ? diretorio.status : "-";
    const tamanho = diretorio.tamanho !== null && diretorio.tamanho !== undefined ? `${diretorio.tamanho}b` : "-";
    const classeTipo = diretorio.tipo === "arquivo" ? "arquivo" : "pasta";

    return {
      key: `diretorio-${diretorio.id}`,
      title: (
        <div className="item-diretorio" onClick={() => selecaoTarget?.set({ tipo: "diretorio", id: diretorio.id })}>
          <FontAwesomeIcon icon={icone} />{" "}
          <span className="nome-diretorio">{diretorio.caminho}</span>{" "}
          <span className={`tag-diretorio ${classeTipo}`}>{tipo}</span>{" "}
          <small>({status} - {tamanho})</small>
        </div>
      ),
      className: "diretorio " + classeTipo + " " + (checked ? "checked " : ""),
      isLeaf: true
    };
  };

  return {
    getDiretorio
  };
};

export default useElementoDiretorio;
