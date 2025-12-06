import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DominioResponse } from "@/types/DominioResponse";
import { NextRequest, NextResponse } from "next/server";
import { TipoDominio } from "@prisma/client";

const includeIp = {
  include: {
    portas: { include: { whatwebResultados: true } },
    dominios: true,
    redes: true,
    usuarios: true,
    diretorios: { include: { whatwebResultados: true } },
    whatwebResultados: true,
  }
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<DominioResponse[]> {
  const p = await params;
  const ret = await prisma.dominio.findMany({
    where: {
      projetoId: Number(p.id),
      tipo: TipoDominio.dns,
      OR: [
        { pai: { tipo: TipoDominio.principal } },
        { pai: null },
      ]
    },
    include: {
      whatwebResultados: true,
      ips: includeIp,
      diretorios: { include: { whatwebResultados: true } },
      subDominios: {
        where: { tipo: TipoDominio.dns },
        include: {
          whatwebResultados: true,
          ips: includeIp,
          diretorios: { include: { whatwebResultados: true } },
          subDominios: {
            where: { tipo: TipoDominio.dns },
            include: {
              whatwebResultados: true,
              ips: includeIp,
              diretorios: { include: { whatwebResultados: true } },
              subDominios: {
                where: { tipo: TipoDominio.dns },
                include: {
                  whatwebResultados: true,
                  ips: includeIp,
                  diretorios: { include: { whatwebResultados: true } },
                  subDominios: true,
                }
              }
            }
          }
        }
      }
    }
  });
  return NextResponse.json(ret);
}
