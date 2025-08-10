import prisma from "..";
import { TipoSambaShare, TipoSambaUser } from "@/service/tools/ip/enum4linux";

export type TipoSambaUserInput = TipoSambaUser;
export type TipoSambaShareInput = TipoSambaShare;

export const adicionarSambaUsers = async (users: TipoSambaUserInput[], ipId: number) => {
    for (const user of users) {
        await prisma.sambaUser.upsert({
            where: {
                nome_ipId: {
                    nome: user.nome,
                    ipId: ipId,
                }
            },
            update: {
                rid: user.rid,
            },
            create: {
                nome: user.nome,
                rid: user.rid,
                ipId: ipId,
            }
        });
    }
}

export const adicionarSambaShares = async (shares: TipoSambaShareInput[], ipId: number) => {
    for (const share of shares) {
        await prisma.sambaShare.upsert({
            where: {
                nome_ipId: {
                    nome: share.nome,
                    ipId: ipId,
                }
            },
            update: {
                tipo: share.tipo,
                comentario: share.comentario,
            },
            create: {
                nome: share.nome,
                tipo: share.tipo,
                comentario: share.comentario,
                ipId: ipId,
            }
        });
    }
}
