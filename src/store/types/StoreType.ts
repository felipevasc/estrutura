import { ProjetoResponse } from "@/types/ProjetoResponse";
import { GenericObjectType } from "./GenericObjectType";
import { ExplorerType } from "@/types/ExplorerType";
import { SelecaoTargetType } from "./SelecaoTargetType";
import { LayoutType } from "@/types/LayoutType";

export type StoreType = {
    projeto?: GenericObjectType<ProjetoResponse>;
    explorer?: GenericObjectType<ExplorerType>;
    selecaoTarget?: GenericObjectType<SelecaoTargetType>;
    layout?: GenericObjectType<LayoutType>;
}