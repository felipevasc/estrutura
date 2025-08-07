import { IpResponse } from "./IpResponse";

export type RedeResponse = {
    id: number;
    cidr: string;
    alias?: string | null;
    projetoId: number;
    paiId?: number | null;
    ips?: IpResponse[];
    subredes?: RedeResponse[];
};
