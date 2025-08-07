import prisma from '@/database';
import { Terminal } from '@/service/terminal';

interface SmbShareInfo {
    name: string;
    comment: string;
    permissions?: string; // Not always available
}

const parseEnum4linuxOutput = (output: string): SmbShareInfo[] => {
    const shares: SmbShareInfo[] = [];
    const lines = output.split('\n');
    let isParsingShares = false;

    for (const line of lines) {
        if (line.includes('Share Enumeration on')) {
            isParsingShares = true;
            continue;
        }
        if (isParsingShares && line.trim() === '' && shares.length > 0) {
            isParsingShares = false;
        }

        if (isParsingShares) {
            const parts = line.split('\t').filter(p => p.trim() !== '');
            if (parts.length >= 2 && parts[0].includes('$')) {
                const name = parts[0].trim();
                const comment = parts.slice(1).join('\t').trim();
                if (name !== 'Sharename' && name !== '') {
                    shares.push({ name, comment });
                }
            }
        }
    }
    return shares;
};

export const executarEnum4linux = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: { id: Number(idIp) },
        include: { portas: true }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const smbPort = ipRecord.portas.find(p => p.numero === 445 && p.status === 'open');

    if (!smbPort) {
        return {
            executedCommand: 'N/A',
            rawOutput: 'Porta 445 (SMB) não está aberta.',
            treatedResult: [],
        };
    }

    const ip = ipRecord.endereco;
    const comando = 'enum4linux-ng.py';
    const argumentos = ['-A', ip];

    console.log(`[Serviço Enum4linux-ng] Iniciando enumeração em ${ip}.`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? '';

    const shares = parseEnum4linuxOutput(rawOutput);
    console.log(`[Serviço Enum4linux-ng] ${shares.length} compartilhamentos encontrados.`);

    if (shares.length > 0) {
        const transactionPromises = shares.map(share =>
            prisma.sMBShare.upsert({
                where: {
                    name_ipId: {
                        name: share.name,
                        ipId: ipRecord.id
                    }
                },
                update: {
                    comment: share.comment,
                },
                create: {
                    name: share.name,
                    comment: share.comment,
                    permissions: '', // Parser doesn't get this yet
                    ipId: ipRecord.id
                }
            })
        );
        await prisma.$transaction(transactionPromises);
    }

    console.log(`[Serviço Enum4linux-ng] Enumeração concluída para o IP ${ip}.`);

    return {
        executedCommand: `${comando} ${argumentos.join(' ')}`,
        rawOutput: rawOutput,
        treatedResult: shares,
    };
};
