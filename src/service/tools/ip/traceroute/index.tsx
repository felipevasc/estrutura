import prisma from '@/database';
import { Terminal } from '@/service/terminal';

interface HopInfo {
    hop: number;
    ipAddress: string;
    hostname?: string; // Not resolving for now, but schema has it
    rtt1?: number;
    rtt2?: number;
    rtt3?: number;
}

const parseTracerouteOutput = (output: string): HopInfo[] => {
    const hops: HopInfo[] = [];
    const lines = output.split('\n');
    const ipRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;

    // Start from index 1 to skip the header line
    for (let i = 1; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        if (!trimmedLine) continue;

        const parts = trimmedLine.split(/\s+/);
        const hopNumber = parseInt(parts[0], 10);

        if (isNaN(hopNumber)) {
            continue;
        }

        const ipMatch = trimmedLine.match(ipRegex);
        const ipAddress = ipMatch ? ipMatch[0] : null;

        if (!ipAddress) {
            hops.push({ hop: hopNumber, ipAddress: '*' });
            continue;
        }

        const rttStrings = trimmedLine.slice(trimmedLine.indexOf(ipAddress) + ipAddress.length).match(/(\d+\.\d+)/g);

        const hopInfo: HopInfo = {
            hop: hopNumber,
            ipAddress: ipAddress,
            rtt1: rttStrings && rttStrings[0] ? parseFloat(rttStrings[0]) : undefined,
            rtt2: rttStrings && rttStrings[1] ? parseFloat(rttStrings[1]) : undefined,
            rtt3: rttStrings && rttStrings[2] ? parseFloat(rttStrings[2]) : undefined,
        };
        hops.push(hopInfo);
    }
    return hops;
};


export const executarTraceroute = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: {
            id: Number(idIp)
        }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const ip = ipRecord.endereco;
    const comando = 'traceroute';
    // Using -I for ICMP probes which is more reliable. -q 1 for one probe per hop.
    const argumentos = ['-I', '-n', '-q', '1', ip];

    console.log(`[Serviço Traceroute] Iniciando processo para ${ip}.`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? '';
    const hops = parseTracerouteOutput(rawOutput);

    console.log(`[Serviço Traceroute] ${hops.length} saltos encontrados para ${ip}.`);

    if (hops.length > 0) {
        // Since createMany with skipDuplicates is not supported on SQLite,
        // we'll delete old hops and create new ones in a transaction.
        await prisma.$transaction([
            prisma.tracerouteHop.deleteMany({
                where: { targetIpId: ipRecord.id }
            }),
            prisma.tracerouteHop.createMany({
                data: hops.map(hop => ({
                    hop: hop.hop,
                    ipAddress: hop.ipAddress,
                    rtt1: hop.rtt1,
                    rtt2: hop.rtt2,
                    rtt3: hop.rtt3,
                    targetIpId: ipRecord.id,
                }))
            })
        ]);
        console.log(`[Serviço Traceroute] Saltos salvos no banco de dados para o IP ${ip}.`);
    }

    return {
        executedCommand: `${comando} ${argumentos.join(' ')}`,
        rawOutput: rawOutput,
        treatedResult: hops,
    };
};
