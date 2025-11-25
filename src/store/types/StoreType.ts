import { ProjetoResponse } from "@/types/ProjetoResponse";
import { GenericObjectType } from "./GenericObjectType";
import { ExplorerType } from "@/types/ExplorerType";
import { SelecaoTargetType } from "./SelecaoTargetType";
import { TipoLayout } from "@/types/TipoLayout";

export type ConfiguracoesType = {
    openaiConfigurado: boolean;
    googleConfigurado: boolean;
};

export type StoreType = {
    projeto?: GenericObjectType<ProjetoResponse>;
    explorer?: GenericObjectType<ExplorerType>;
    selecaoTarget?: GenericObjectType<SelecaoTargetType>;
    layout?: GenericObjectType<TipoLayout>;
    configuracoes?: GenericObjectType<ConfiguracoesType>;
    isConfiguracoesOpen?: GenericObjectType<boolean>;
}