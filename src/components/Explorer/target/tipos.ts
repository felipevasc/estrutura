import { TreeDataNode } from "antd";

export type NoCarregavel = TreeDataNode & { carregar?: () => Promise<NoCarregavel[]> };
export type LimitadorArvore = (chave: string, lista: NoCarregavel[]) => NoCarregavel[];
