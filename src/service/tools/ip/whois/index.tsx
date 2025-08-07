import prisma from '@/database';
import { Terminal } from '@/service/terminal';

export const executarWhois = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: {
            id: Number(idIp)
        }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const ip = ipRecord.endereco;
    const comando = 'whois';
    const argumentos = [ip];

    console.log(`[Serviço Whois] Iniciando processo para ${ip}.`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? '';

    const whoisInfo = await prisma.whoisInfo.create({
        data: {
            rawText: rawOutput,
            ipId: ipRecord.id,
        }
    });

    console.log(`[Serviço Whois] Informações salvas no banco de dados para o IP ${ip}.`);

    return {
        executedCommand: `${comando} ${argumentos.join(' ')}`,
        rawOutput: rawOutput,
        treatedResult: whoisInfo,
    };
};
