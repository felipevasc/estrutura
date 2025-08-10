import { SambaShare, SambaUser } from "@prisma/client";

export interface SambaInfoResponse {
    users: SambaUser[];
    shares: SambaShare[];
}
