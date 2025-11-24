import prisma from "@/database";

const formatList = (items: string[]): string => items.length ? items.join(", ") : "Nenhum";

export const buildProjectContext = async (projectId: number): Promise<string> => {
    const projeto = await prisma.projeto.findUnique({ where: { id: projectId } });
    if (!projeto) {
        return "Nenhum projeto encontrado para o contexto.";
    }

    const [dominios, ips, redes, diretoriosRecentes, comandosRecentes] = await Promise.all([
        prisma.dominio.findMany({
            where: { projetoId: projectId },
            include: {
                ips: true,
                diretorios: true,
            }
        }),
        prisma.ip.findMany({
            where: { projetoId: projectId },
            include: {
                portas: true,
                usuarios: true,
                dominios: true,
                diretorios: true,
            }
        }),
        prisma.rede.findMany({ where: { projetoId: projectId }, include: { ips: true } }),
        prisma.diretorio.findMany({
            where: { OR: [{ dominio: { projetoId } }, { ip: { projetoId } }] },
            orderBy: { createdAt: 'desc' },
            take: 25,
            include: { dominio: true, ip: true },
        }),
        prisma.command.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, take: 10 })
    ]);

    const dominiosTexto = dominios.length ? dominios.map((d) => {
        const relacionados = formatList(d.ips.map((ip) => ip.endereco));
        const dirs = formatList(d.diretorios.map((dir) => dir.caminho));
        return `- ${d.endereco} (id ${d.id}) | alias: ${d.alias ?? 'nenhum'} | IPs: ${relacionados} | diretórios: ${dirs}`;
    }).join("\n") : "Nenhum domínio registrado.";

    const ipsTexto = ips.length ? ips.map((ip) => {
        const portas = ip.portas.length ? ip.portas.map((p) => `${p.numero}/${p.protocolo || ''}${p.servico ? ' - ' + p.servico : ''}`).join(', ') : 'Nenhuma porta registrada';
        const usuarios = formatList(ip.usuarios.map((u) => u.nome));
        const dominiosRelacionados = formatList(ip.dominios.map((d) => d.endereco));
        const dirs = formatList(ip.diretorios.map((dir) => dir.caminho));
        return `- ${ip.endereco} (id ${ip.id}) | domínios: ${dominiosRelacionados} | portas: ${portas} | usuários: ${usuarios} | diretórios: ${dirs}`;
    }).join("\n") : "Nenhum IP registrado.";

    const redesTexto = redes.length ? redes.map((r) => `- ${r.cidr} (id ${r.id}) com IPs: ${formatList(r.ips.map((ip) => ip.endereco))}`).join("\n") : "Nenhuma rede registrada.";

    const diretoriosTexto = diretoriosRecentes.length ? diretoriosRecentes.map((d) => {
        const alvo = d.dominio ? `domínio ${d.dominio.endereco}` : d.ip ? `IP ${d.ip.endereco}` : 'alvo não informado';
        return `- ${d.caminho} em ${alvo} (status ${d.status ?? 's/ status'}, tamanho ${d.tamanho ?? 's/ tamanho'})`;
    }).join("\n") : "Nenhum diretório descoberto.";

    const comandosTexto = comandosRecentes.length ? comandosRecentes.map((c) => `${c.command} -> ${c.status} (${c.executedCommand || 'sem log'})`).join("\n") : "Nenhum comando executado ainda.";

    return [
        `Projeto: ${projeto.nome} (ID ${projeto.id})`,
        "Domínios:",
        dominiosTexto,
        "IPs:",
        ipsTexto,
        "Redes:",
        redesTexto,
        "Diretórios recentes:",
        diretoriosTexto,
        "Histórico de comandos:",
        comandosTexto
    ].join("\n");
};
