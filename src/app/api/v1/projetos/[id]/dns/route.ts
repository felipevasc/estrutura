import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DominioResponse } from "@/types/DominioResponse";
import { NextRequest, NextResponse } from "next/server";
import { TipoDominio } from "@prisma/client";
import { montarIncludeDominio } from "../../../dominios/includes";

const obterLimite = (req: NextRequest) => {
  const limite = Number(req.nextUrl.searchParams.get("limiteFilhos") ?? 0);
  if (Number.isNaN(limite)) return 0;
  return limite;
};

const obterLimitarDiretos = (req: NextRequest) => req.nextUrl.searchParams.get("limitarDiretos") !== "false";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<DominioResponse[]> {
  const p = await params;
  const limiteFilhos = obterLimite(req);
  const limitarDiretos = obterLimitarDiretos(req);
  const ret = await prisma.dominio.findMany({
    where: {
      projetoId: Number(p.id),
      tipo: TipoDominio.dns,
      OR: [
        { pai: { tipo: TipoDominio.principal } },
        { pai: null },
      ]
    },
    include: montarIncludeDominio(limiteFilhos, limitarDiretos, 4, TipoDominio.dns),
  });
  return NextResponse.json(ret);
}
