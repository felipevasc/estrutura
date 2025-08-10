import path from 'node:path';
import os from 'node:os';
import { Terminal } from '@/service/terminal';
import prisma from '@/database';
import Database from '@/database/Database';

export type TipoSambaUser = {
    nome: string;
    rid: string;
};

export type TipoSambaShare = {
    nome: string;
    tipo: string;
    comentario: string;
};

export const executarEnum4linux = async (idIp: string) => {
    const op = await prisma.ip.findFirst({
        where: {
            id: Number(idIp)
        }
    });
    const enderecoIp = op?.endereco ?? "";

    const nomeArquivoSaida = `enum4linux_resultado_${op?.projetoId}_${op?.id}_${enderecoIp}_${Date.now()}.txt`;
    const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

    const comando = 'enum4linux-ng';
    const argumentos = ['-A', enderecoIp];

    const resultado = await Terminal(comando, argumentos, caminhoSaida);
    const saida = resultado.saidaComando ?? "";

    const parseUsers = (output: string): TipoSambaUser[] => {
        const users: TipoSambaUser[] = [];
        const userRegex = /index: \d+ rid: (0x[a-f0-9]+) name: (\w+)/g;
        let match;
        while ((match = userRegex.exec(output)) !== null) {
            users.push({ rid: match[1], nome: match[2] });
        }
        return users;
    };

    const parseShares = (output: string): TipoSambaShare[] => {
        const shares: TipoSambaShare[] = [];
        const shareRegex = /^(\S+)\s+(Disk|Pipe|Print)\s+(.*)$/gm;
        let match;
        const lines = output.split('\n');
        let startParsing = false;
        for (const line of lines) {
            if (line.includes('Sharename')) {
                startParsing = true;
                continue;
            }
            if (startParsing && line.trim() !== '' && !line.startsWith('---')) {
                const parts = line.split(/\s\s+/);
                if (parts.length >= 3) {
                    shares.push({
                        nome: parts[0].trim(),
                        tipo: parts[1].trim(),
                        comentario: parts[2].trim()
                    });
                }
            }
        }
        return shares;
    };


    const users = parseUsers(saida);
    const shares = parseShares(saida);

    await Database.adicionarSambaUsers(users, Number(idIp));
    await Database.adicionarSambaShares(shares, Number(idIp));

    return {
        executedCommand: `${comando} ${argumentos.join(' ')}`,
        rawOutput: resultado.saidaComando,
        treatedResult: {
            users,
            shares
        },
    };
};
