import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Id da porta é obrigatório" }, { status: 400 });
  }
  const ret = await prisma.porta.findFirst({
    where: { id: Number(id) },
    include: { ip: true }
  });
  return NextResponse.json(ret);
}

