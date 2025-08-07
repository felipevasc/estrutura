import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface NmapExecutionResult {
    success: boolean;
    message: string;
    rawOutput?: string;
}

export const executeNmap = async (ipAddress: string, idIp: number): Promise<NmapExecutionResult> => {
    try {
        const { stdout, stderr } = await execAsync(`nmap -Pn -sV -oX - ${ipAddress}`);

        if (stderr) {
            console.error(`Nmap stderr: ${stderr}`);
            return { success: false, message: `Nmap execution failed: ${stderr}`, rawOutput: stderr };
        }

        await parseAndSaveNmapOutput(stdout, idIp);

        return { success: true, message: 'Nmap scan completed and data saved.', rawOutput: stdout };
    } catch (error) {
        console.error(`Nmap execution error: ${error}`);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Nmap execution failed: ${errorMessage}`, rawOutput: errorMessage };
    }
};

interface ParsedPort {
    numero: number;
    protocolo: string;
    status: string;
    servico: string;
    banner: string;
    ipId: number;
}

const parseAndSaveNmapOutput = async (xmlOutput: string, idIp: number) => {
    const ports: ParsedPort[] = [];
    // Basic parsing logic, a more robust solution would use an XML parser library
    const portRegex = /<port protocol="(\w+)" portid="(\d+)"><state state="(\w+)" reason="[^"]*" reason_ttl="[^"]*"\/>(<service name="([^"]*)" product="([^"]*)" version="([^"]*)" extrainfo="([^"]*)" method="[^"]*"\/>)?/g;
    let match;
    while ((match = portRegex.exec(xmlOutput)) !== null) {
        ports.push({
            numero: parseInt(match[2], 10),
            protocolo: match[1],
            status: match[3],
            servico: match[5] || 'unknown',
            banner: match[6] ? `${match[6]} ${match[7]} ${match[8]}`.trim() : '',
            ipId: idIp,
        });
    }

    if (ports.length > 0) {
        await prisma.porta.createMany({
            data: ports,
        });
    }
};
