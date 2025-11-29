"use client";
import { Tree, TreeDataNode } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { StyledArvoreUsuario, StyledTitleUsuario } from "./styles";
import StoreContext from "@/store";
import useApi from "@/api";
import useElementoUsuario from "../../target/ElementoUsuario";

const ArvoreUsuarios = () => {
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const idProjeto = useMemo(() => projeto?.get()?.id, [projeto]);
  const { data: usuariosProjeto } = api.usuarios.useUsuariosProjeto(idProjeto);
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);
  const elementoUsuario = useElementoUsuario();

  useEffect(() => {
    const carregar = async () => {
        const itens: TreeDataNode[] = [];
        if (usuariosProjeto) {
            for (const usuario of usuariosProjeto) {
                itens.push(await elementoUsuario.getUsuario(usuario));
            }
        }
        setElementos(itens);
    };
    carregar();
  }, [usuariosProjeto, elementoUsuario]);

  return (
    <StyledArvoreUsuario>
      <StyledTitleUsuario>usuário</StyledTitleUsuario>
      <Tree treeData={elementos} showIcon={true} showLine={true} />
    </StyledArvoreUsuario>
  );
};

export default ArvoreUsuarios;
