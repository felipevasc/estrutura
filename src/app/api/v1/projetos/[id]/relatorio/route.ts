import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { ItemRelatorio } from "@/types/Relatorio";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
        return NextResponse.json({ error: "ID de projeto inválido" }, { status: 400 });
    }

    try {
        const [dominios, ips, diretorios, whatwebResultados] = await Promise.all([
            prisma.dominio.findMany({
                where: { projetoId: projectId },
                include: { ips: true }
            }),
            prisma.ip.findMany({
                where: { projetoId: projectId },
                include: { portas: true, dominios: true }
            }),
            prisma.diretorio.findMany({
                where: {
                    OR: [
                        { dominio: { projetoId: projectId } },
                        { ip: { projetoId: projectId } }
                    ]
                },
                include: { dominio: true, ip: true }
            }),
            prisma.whatwebResultado.findMany({
                where: {
                    OR: [
                        { dominio: { projetoId: projectId } },
                        { ip: { projetoId: projectId } },
                        { diretorio: { dominio: { projetoId: projectId } } },
                        { diretorio: { ip: { projetoId: projectId } } },
                        { porta: { ip: { projetoId: projectId } } }
                    ]
                },
                include: {
                    dominio: true,
                    ip: true,
                    porta: { include: { ip: true } },
                    diretorio: { include: { dominio: true, ip: true } }
                }
            })
        ]);

        const items: ItemRelatorio[] = [];

        // Processar Domínios
        dominios.forEach(d => {
            items.push({
                id: `dom-${d.id}`,
                tipo: 'Dominio',
                valor: d.endereco,
                dominio: d.endereco,
                ip: null
            });
        });

        // Processar IPs e Portas
        ips.forEach(i => {
            items.push({
                id: `ip-${i.id}`,
                tipo: 'IP',
                valor: i.endereco,
                dominio: i.dominios.length > 0 ? i.dominios[0].endereco : null,
                ip: i.endereco
            });

            i.portas.forEach(p => {
                items.push({
                    id: `port-${p.id}`,
                    tipo: 'Porta',
                    valor: String(p.numero),
                    porta: p.numero,
                    servico: p.servico,
                    protocolo: p.protocolo,
                    dominio: i.dominios.length > 0 ? i.dominios[0].endereco : null,
                    ip: i.endereco
                });
            });
        });

        // Processar Diretórios
        diretorios.forEach(d => {
            items.push({
                id: `dir-${d.id}`,
                tipo: 'Diretorio',
                valor: d.caminho,
                status: d.status,
                tamanho: d.tamanho,
                dominio: d.dominio?.endereco || null,
                ip: d.ip?.endereco || null,
                criadoEm: d.createdAt.toISOString()
            });
        });

        // Processar WhatWeb
        whatwebResultados.forEach(w => {
            items.push({
                id: `ww-${w.id}`,
                tipo: 'WhatWeb',
                valor: `${w.plugin}: ${w.valor}`,
                plugin: w.plugin,
                pluginValor: w.valor,
                dominio: w.dominio?.endereco || w.diretorio?.dominio?.endereco || null,
                ip: w.ip?.endereco || w.porta?.ip?.endereco || w.diretorio?.ip?.endereco || null,
                porta: w.porta?.numero || null,
                criadoEm: w.criadoEm.toISOString()
            });
        });

        return NextResponse.json(items);

    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
