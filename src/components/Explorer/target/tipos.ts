import { TreeDataNode } from "antd";

export type NoCarregavel = TreeDataNode & { carregar?: () => Promise<NoCarregavel[]> };
