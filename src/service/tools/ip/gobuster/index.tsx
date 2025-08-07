import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import { Porta } from '@prisma/client';

interface GobusterResult {
    path: string;
    statusCode: number;
}

const parseGobusterOutput = (output: string): GobusterResult[] => {
    const results: GobusterResult[] = [];
    const lines = output.split('\n');
    // Example: /index.html (Status: 200)
    const resultRegex = /^(.*) \(Status: (\d{3})\)/;

    for (const line of lines) {
        const match = line.match(resultRegex);
        if (match) {
            const [, path, statusCode] = match;
            results.push({ path: path.trim(), statusCode: parseInt(statusCode, 10) });
        }
    }
    return results;
};

export const executarGobuster = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: { id: Number(idIp) },
        include: { portas: true }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const webPorts = ipRecord.portas.filter(p =>
        p.status === 'open' && (p.servico?.includes('http') || p.servico?.includes('ssl/http'))
    );

    if (webPorts.length === 0) {
        return {
            executedCommand: 'N/A',
            rawOutput: 'Nenhuma porta web (http/https) aberta encontrada.',
            treatedResult: [],
        };
    }

    const ip = ipRecord.endereco;
    const wordlist = '/usr/share/wordlists/dirb/common.txt'; // A common default
    let allRawOutput = '';
    let allTreatedResults: { port: number, results: GobusterResult[] }[] = [];
    let allExecutedCommands = '';

    for (const porta of webPorts) {
        const protocol = porta.servico?.includes('ssl') ? 'https' : 'http';
        const url = `${protocol}://${ip}:${porta.numero}`;
        const comando = 'gobuster';
        const argumentos = ['dir', '-u', url, '-w', wordlist, '-q', '-t', '50'];

        const executedCommand = `${comando} ${argumentos.join(' ')}`;
        allExecutedCommands += executedCommand + '\n';
        console.log(`[Serviço Gobuster] Iniciando varredura em ${url}.`);

        const resultado = await Terminal(comando, argumentos);
        const rawOutput = resultado.saidaComando ?? '';
        allRawOutput += `\n--- Output for ${url} ---\n` + rawOutput;

        const results = parseGobusterOutput(rawOutput);
        allTreatedResults.push({ port: porta.numero, results });

        if (results.length > 0) {
            const transactionPromises = results.map(result =>
                prisma.webAppPath.upsert({
                    where: {
                        path_portaId: {
                            path: result.path,
                            portaId: porta.id
                        }
                    },
                    update: {
                        statusCode: result.statusCode,
                    },
                    create: {
                        path: result.path,
                        statusCode: result.statusCode,
                        portaId: porta.id
                    }
                })
            );
            await prisma.$transaction(transactionPromises);
        }
    }

    console.log(`[Serviço Gobuster] Varredura concluída para o IP ${ip}.`);

    return {
        executedCommand: allExecutedCommands.trim(),
        rawOutput: allRawOutput.trim(),
        treatedResult: allTreatedResults,
    };
};
