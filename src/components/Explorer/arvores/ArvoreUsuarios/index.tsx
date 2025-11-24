"use client";
import { Tree, TreeDataNode } from "antd";
import { useContext, useEffect, useState } from "react";
import { StyledArvoreUsuario, StyledTitleUsuario } from "./styles";
import StoreContext from "@/store";
import useApi from "@/api";
import useElementoUsuario from "../../target/ElementoUsuario";

const ArvoreUsuarios = () => {
  const api = useApi();
  const { projeto, selecaoTarget } = useContext(StoreContext);
  const { data: usuariosProjeto } = api.usuarios.getUsuariosProjeto(projeto?.get()?.id);
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);
  const elementoUsuario = useElementoUsuario();

  useEffect(() => {
    const carregar = async () => {
        const elems: TreeDataNode[] = [];
        if (usuariosProjeto) {
            for (const u of usuariosProjeto) {
                elems.push(await elementoUsuario.getUsuario(u));
            }
        }
        setElementos(elems);
    };
    carregar();
  }, [usuariosProjeto]);

  return (
    <StyledArvoreUsuario>
      <StyledTitleUsuario>usuário</StyledTitleUsuario>
      <Tree treeData={elementos} showIcon={true} showLine={true} />
    </StyledArvoreUsuario>
  );
};

export default ArvoreUsuarios;
