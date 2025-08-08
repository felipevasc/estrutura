import { ProjetoResponse } from "@/types/ProjetoResponse"
import { GenericObjectType } from "./GenericObjectType"
import { ExplorerType } from "@/types/ExplorerType"
import { SelecaoTargetType } from "./SelecaoTargetType"
import { TemaType } from "@/theme"

export type StoreType = {
    projeto?: GenericObjectType<ProjetoResponse>
    explorer?: GenericObjectType<ExplorerType>
    selecaoTarget?: GenericObjectType<SelecaoTargetType>
    tema?: GenericObjectType<TemaType>
}
