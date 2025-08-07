import prisma from '@/database';
import { Terminal } from '@/service/terminal';

const parseDigOutput = (output: string): string => {
    // With +short, the output is just the PTR record, ending with a dot.
    // We can just trim it.
    return output.trim().replace(/\.$/, ''); // Remove trailing dot if present
};

export const executarDigRev = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: {
            id: Number(idIp)
        }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const ip = ipRecord.endereco;
    const comando = 'dig';
    const argumentos = ['-x', ip, '+short'];

    console.log(`[Serviço Dig-Rev] Iniciando processo para ${ip}.`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? '';
    const reverseDns = parseDigOutput(rawOutput);

    if (reverseDns) {
        await prisma.ip.update({
            where: {
                id: ipRecord.id,
            },
            data: {
                reverseDns: reverseDns,
            }
        });
        console.log(`[Serviço Dig-Rev] DNS Reverso "${reverseDns}" salvo para o IP ${ip}.`);
    } else {
        console.log(`[Serviço Dig-Rev] Nenhum resultado de DNS Reverso para o IP ${ip}.`);
    }

    return {
        executedCommand: `${comando} ${argumentos.join(' ')}`,
        rawOutput: rawOutput,
        treatedResult: { reverseDns },
    };
};
