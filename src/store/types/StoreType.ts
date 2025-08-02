import { ProjetoResponse } from "@/types/ProjetoResponse";
import { GenericObjectType } from "./GenericObjectType";
import { ExplorerType } from "@/types/ExplorerType";

export type StoreType = {
    projeto?: GenericObjectType<ProjetoResponse>;
    explorer?: GenericObjectType<ExplorerType>;   
}