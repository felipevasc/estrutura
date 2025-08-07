import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import { Porta } from '@prisma/client';

// nmap -sV -Pn 186.232.56.10 -oG -

interface NmapPortInfo {
    numero: number;
    protocolo: string;
    status: string;
    servico: string;
    versao: string;
}

const parseNmapOutput = (output: string): NmapPortInfo[] => {
    const ports: NmapPortInfo[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
        if (line.includes("Ports: ")) {
            // Example line: Ports: 21/open/tcp//ftp//vsftpd 3.0.3/, 22/open/tcp//ssh//OpenSSH 7.6p1 Ubuntu 4ubuntu0.7/, 80/open/tcp//http//Apache httpd 2.4.29 ((Ubuntu))/
            const portSection = line.split("Ports: ")[1];
            const portStrings = portSection.split(', ').filter(p => p.trim() !== '');

            for (const portString of portStrings) {
                // Example portString: 21/open/tcp//ftp//vsftpd 3.0.3/
                const parts = portString.split('/');
                if (parts.length >= 7) {
                    const portInfo: NmapPortInfo = {
                        numero: parseInt(parts[0], 10),
                        status: parts[1],
                        protocolo: parts[2],
                        servico: parts[4],
                        versao: parts[6],
                    };
                    ports.push(portInfo);
                }
            }
        }
    }
    return ports;
};


export const executarNmapSv = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: {
            id: Number(idIp)
        }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const ip = ipRecord.endereco;
    const comando = 'nmap';
    const argumentos = ['-sV', '-Pn', '--open', '-oG', '-', ip];

    console.log(`[Serviço Nmap-SV] Iniciando processo para ${ip}.`);

    const resultado = await Terminal(comando, argumentos);
    const portas = parseNmapOutput(resultado.saidaComando ?? '');

    console.log(`[Serviço Nmap-SV] ${portas.length} portas encontradas para ${ip}.`);

    const transaction = portas.map(porta =>
        prisma.porta.upsert({
            where: {
                numero_protocolo_ipId: {
                    numero: porta.numero,
                    protocolo: porta.protocolo,
                    ipId: ipRecord.id,
                }
            },
            update: {
                status: porta.status,
                servico: porta.servico,
                versao: porta.versao,
            },
            create: {
                numero: porta.numero,
                protocolo: porta.protocolo,
                status: porta.status,
                servico: porta.servico,
                versao: porta.versao,
                ipId: ipRecord.id,
            }
        })
    );

    await prisma.$transaction(transaction);

    console.log(`[Serviço Nmap-SV] Portas salvas no banco de dados para o IP ${ip}.`);

    return {
        executedCommand: `${comando} ${argumentos.join(' ')}`,
        rawOutput: resultado.saidaComando,
        treatedResult: portas,
    };
};
