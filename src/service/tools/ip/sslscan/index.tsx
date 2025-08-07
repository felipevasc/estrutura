import prisma from '@/database';
import { Terminal } from '@/service/terminal';

interface CipherInfo {
    protocol: string;
    name: string;
    bits: number;
}

const parseSslScanOutput = (output: string): CipherInfo[] => {
    const ciphers: CipherInfo[] = [];
    const lines = output.split('\n');
    const cipherRegex = /Accepted\s+(TLSv[0-9.]+)\s+(\d+)\s+bits\s+(.*)/;

    for (const line of lines) {
        const match = line.trim().match(cipherRegex);
        if (match) {
            const [, protocol, bits, name] = match;
            ciphers.push({ protocol, name, bits: parseInt(bits, 10) });
        }
    }
    return ciphers;
};

export const executarSslscan = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: { id: Number(idIp) },
        include: { portas: true }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const sslPorts = ipRecord.portas.filter(p =>
        p.status === 'open' && p.servico?.includes('ssl')
    );

    if (sslPorts.length === 0) {
        return {
            executedCommand: 'N/A',
            rawOutput: 'Nenhuma porta com SSL/TLS encontrada.',
            treatedResult: [],
        };
    }

    const ip = ipRecord.endereco;
    let allRawOutput = '';
    let allTreatedResults: { port: number, ciphers: CipherInfo[] }[] = [];
    let allExecutedCommands = '';

    for (const porta of sslPorts) {
        const target = `${ip}:${porta.numero}`;
        const comando = 'sslscan';
        const argumentos = ['--no-colour', target];

        const executedCommand = `${comando} ${argumentos.join(' ')}`;
        allExecutedCommands += executedCommand + '\n';
        console.log(`[Serviço Sslscan] Iniciando varredura em ${target}.`);

        const resultado = await Terminal(comando, argumentos);
        const rawOutput = resultado.saidaComando ?? '';
        allRawOutput += `\n--- Output for ${target} ---\n` + rawOutput;

        const ciphers = parseSslScanOutput(rawOutput);
        allTreatedResults.push({ port: porta.numero, ciphers });

        if (ciphers.length > 0) {
            const transactionPromises = ciphers.map(cipher =>
                prisma.sSLCipher.upsert({
                    where: {
                        name_portaId: {
                            name: cipher.name,
                            portaId: porta.id
                        }
                    },
                    update: {
                        protocol: cipher.protocol,
                        bits: cipher.bits,
                    },
                    create: {
                        protocol: cipher.protocol,
                        name: cipher.name,
                        bits: cipher.bits,
                        portaId: porta.id
                    }
                })
            );
            await prisma.$transaction(transactionPromises);
        }
    }

    console.log(`[Serviço Sslscan] Varredura concluída para o IP ${ip}.`);

    return {
        executedCommand: allExecutedCommands.trim(),
        rawOutput: allRawOutput.trim(),
        treatedResult: allTreatedResults,
    };
};
