import { ProjetoResponse } from "@/types/ProjetoResponse";
import { GenericObjectType } from "./GenericObjectType";
import { ExplorerType } from "@/types/ExplorerType";
import { SelecaoTargetType } from "./SelecaoTargetType";
import { TipoLayout } from "@/types/TipoLayout";

export type StoreType = {
    projeto?: GenericObjectType<ProjetoResponse>;
    explorer?: GenericObjectType<ExplorerType>;
    selecaoTarget?: GenericObjectType<SelecaoTargetType>;
    layout?: GenericObjectType<TipoLayout>;
}