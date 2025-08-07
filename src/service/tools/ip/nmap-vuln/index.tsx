import prisma from '@/database';
import { Terminal } from '@/service/terminal';

interface VulnerabilityInfo {
    titulo: string;
    descricao: string;
    severidade: string;
    referencias: string;
}

const parseNmapVulnOutput = (output: string): Record<number, VulnerabilityInfo[]> => {
    const vulnerabilities: Record<number, VulnerabilityInfo[]> = {};
    const lines = output.split('\n');
    let currentPort = 0;
    let currentVuln: Partial<VulnerabilityInfo> = {};
    let isParsingVuln = false;

    const stateRegex = /State: VULNERABLE/;
    const titleRegex = /^\s*\|_\s*(.*)/;
    const detailsRegex = /^\s*\|\s+(.*)/;

    for (const line of lines) {
        if (line.match(/^\d+\/tcp/) || line.match(/^\d+\/udp/)) {
            // Finalize the last vulnerability for the previous port before switching
            if (isParsingVuln && currentVuln.titulo && currentPort > 0) {
                vulnerabilities[currentPort].push(currentVuln as VulnerabilityInfo);
            }
            // Start new port
            currentPort = parseInt(line.split('/')[0], 10);
            if (!vulnerabilities[currentPort]) {
                vulnerabilities[currentPort] = [];
            }
            isParsingVuln = false;
            currentVuln = {};
        }

        if (stateRegex.test(line)) {
            isParsingVuln = true;
            // The actual title is on the next line, so we just set the flag
            currentVuln = { severidade: 'High', descricao: '', referencias: '' };
        }

        if (isParsingVuln && currentVuln.severidade) { // severidade is our flag
            const titleMatch = line.match(titleRegex);
            if (titleMatch) {
                currentVuln.titulo = titleMatch[1].trim();
            }

            const detailsMatch = line.match(detailsRegex);
            if (detailsMatch && currentVuln.titulo && !line.includes('State: VULNERABLE') && !line.includes(currentVuln.titulo)) {
                 if (detailsMatch[1].toLowerCase().startsWith('references:')) {
                    currentVuln.referencias += detailsMatch[1] + '\n';
                 } else {
                    currentVuln.descricao += detailsMatch[1] + '\n';
                 }
            }
        }
    }

    if (isParsingVuln && currentVuln.titulo && currentPort > 0) {
        vulnerabilities[currentPort].push(currentVuln as VulnerabilityInfo);
    }

    return vulnerabilities;
};


export const executarNmapVuln = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: { id: Number(idIp) },
        include: { portas: true }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const openPorts = ipRecord.portas.filter(p => p.status === 'open').map(p => p.numero);
    if (openPorts.length === 0) {
        return {
            executedCommand: 'N/A',
            rawOutput: 'Nenhuma porta aberta para escanear.',
            treatedResult: [],
        };
    }

    const ip = ipRecord.endereco;
    const portString = openPorts.join(',');
    const comando = 'nmap';
    const argumentos = ['-sV', '--script', 'vuln', '-p', portString, ip];

    console.log(`[Serviço Nmap-Vuln] Iniciando varredura de vulnerabilidades em ${ip}:${portString}.`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? '';
    const vulnsByPort = parseNmapVulnOutput(rawOutput);

    console.log(`[Serviço Nmap-Vuln] Análise concluída para ${ip}.`);

    const transactionPromises = [];
    for (const portNumberStr in vulnsByPort) {
        const portNumber = parseInt(portNumberStr, 10);
        const portaRecord = ipRecord.portas.find(p => p.numero === portNumber);

        if (portaRecord) {
            for (const vuln of vulnsByPort[portNumber]) {
                const promise = prisma.vulnerabilidade.upsert({
                    where: {
                        titulo_portaId: {
                            titulo: vuln.titulo,
                            portaId: portaRecord.id,
                        }
                    },
                    update: {
                        descricao: vuln.descricao,
                        severidade: vuln.severidade,
                        referencias: vuln.referencias,
                    },
                    create: {
                        titulo: vuln.titulo,
                        descricao: vuln.descricao,
                        severidade: vuln.severidade,
                        referencias: vuln.referencias,
                        portaId: portaRecord.id,
                    }
                });
                transactionPromises.push(promise);
            }
        }
    }

    await prisma.$transaction(transactionPromises);
    console.log(`[Serviço Nmap-Vuln] Vulnerabilidades salvas no banco de dados para o IP ${ip}.`);

    return {
        executedCommand: `${comando} ${argumentos.join(' ')}`,
        rawOutput: rawOutput,
        treatedResult: vulnsByPort,
    };
};
