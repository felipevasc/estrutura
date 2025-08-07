import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import { Porta } from '@prisma/client';

interface NiktoFinding {
    osvdbid: string;
    method: string;
    uri: string;
    description: string;
}

const parseNiktoOutput = (output: string): NiktoFinding[] => {
    const findings: NiktoFinding[] = [];
    const lines = output.split('\n');
    // Example: + OSVDB-3233: /icons/README: Apache default file found.
    const findingRegex = /^\+ OSVDB-(\d+): (.*): (.*)$/;

    for (const line of lines) {
        const match = line.match(findingRegex);
        if (match) {
            const [, osvdbid, uri, description] = match;
            // Nikto doesn't always provide the method, so we'll leave it blank.
            findings.push({ osvdbid, method: '', uri, description });
        }
    }
    return findings;
};

export const executarNikto = async (idIp: string) => {
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
    let allRawOutput = '';
    let allTreatedResults: { port: number, findings: NiktoFinding[] }[] = [];
    let allExecutedCommands = '';

    for (const porta of webPorts) {
        const comando = 'nikto';
        const isSsl = porta.servico?.includes('ssl') ?? false;
        const argumentos = ['-h', ip, '-p', porta.numero.toString()];
        if(isSsl) {
            argumentos.push('-ssl');
        }

        const executedCommand = `${comando} ${argumentos.join(' ')}`;
        allExecutedCommands += executedCommand + '\n';
        console.log(`[Serviço Nikto] Iniciando varredura em ${ip}:${porta.numero}.`);

        const resultado = await Terminal(comando, argumentos);
        const rawOutput = resultado.saidaComando ?? '';
        allRawOutput += `\n--- Output for port ${porta.numero} ---\n` + rawOutput;

        const findings = parseNiktoOutput(rawOutput);
        allTreatedResults.push({ port: porta.numero, findings });

        if (findings.length > 0) {
            const transactionPromises = findings.map(finding =>
                prisma.vulnerabilidade.upsert({
                    where: {
                        titulo_portaId: {
                            titulo: `Nikto: ${finding.uri}`,
                            portaId: porta.id
                        }
                    },
                    create: {
                        titulo: `Nikto: ${finding.uri}`,
                        descricao: finding.description,
                        severidade: 'Informational',
                        referencias: `OSVDB-${finding.osvdbid}`,
                        portaId: porta.id
                    },
                    update: {
                        descricao: finding.description,
                    }
                })
            );
            await prisma.$transaction(transactionPromises);
        }
    }

    console.log(`[Serviço Nikto] Varredura concluída para o IP ${ip}.`);

    return {
        executedCommand: allExecutedCommands.trim(),
        rawOutput: allRawOutput.trim(),
        treatedResult: allTreatedResults,
    };
};
