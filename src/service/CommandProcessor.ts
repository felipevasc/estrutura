import prisma from '@/database';
import { CommandStatus } from '@prisma/client';
import { iniciarEnumeracaoAmass } from '@/service/tools/domain/amass';
// I need to find the correct path for the other services
// Let's assume the exports exist based on my previous analysis
import { executarSubfinder } from '@/service/tools/domain/subfinder';
import { executarNslookup } from '@/service/tools/domain/nslookup';
import { executarNmapSv } from '@/service/tools/ip/nmap-sv';
import { executarWhois } from '@/service/tools/ip/whois';
import { executarDigRev } from '@/service/tools/ip/dig-rev';
import { executarTraceroute } from '@/service/tools/ip/traceroute';
import { executarNmapVuln } from '@/service/tools/ip/nmap-vuln';
import { executarNikto } from '@/service/tools/ip/nikto';
import { executarGobuster } from '@/service/tools/ip/gobuster';
import { executarEnum4linux } from '@/service/tools/ip/enum4linux-ng';
import { executarSslscan } from '@/service/tools/ip/sslscan';
import { executarSearchsploit } from '@/service/tools/ip/searchsploit';

// A map to associate command names with their service functions.
const commandServiceMap: { [key: string]: (args: any) => Promise<any> } = {
    // Domain tools
    'amass': (args) => iniciarEnumeracaoAmass(args.idDominio),
    'subfinder': (args) => executarSubfinder(args.idDominio),
    'nslookup': (args) => executarNslookup(args.idDominio),

    // IP tools
    'nmap-sv': (args) => executarNmapSv(args.idIp),
    'whois': (args) => executarWhois(args.idIp),
    'dig-rev': (args) => executarDigRev(args.idIp),
    'traceroute': (args) => executarTraceroute(args.idIp),
    'nmap-vuln': (args) => executarNmapVuln(args.idIp),
    'nikto': (args) => executarNikto(args.idIp),
    'gobuster': (args) => executarGobuster(args.idIp),
    'enum4linux-ng': (args) => executarEnum4linux(args.idIp),
    'sslscan': (args) => executarSslscan(args.idIp),
    'searchsploit': (args) => executarSearchsploit(args.idIp),
};

class CommandProcessor {
    private static instance: CommandProcessor;
    private isProcessing = false;

    private constructor() { }

    public static getInstance(): CommandProcessor {
        if (!CommandProcessor.instance) {
            CommandProcessor.instance = new CommandProcessor();
        }
        return CommandProcessor.instance;
    }

    public async processQueue(): Promise<void> {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        const command = await prisma.command.findFirst({
            where: { status: CommandStatus.PENDING },
            orderBy: { createdAt: 'asc' },
        });

        if (command) {
            await prisma.command.update({
                where: { id: command.id },
                data: { status: CommandStatus.RUNNING, startedAt: new Date() },
            });

            try {
                const serviceFunction = commandServiceMap[command.command];
                if (!serviceFunction) {
                    throw new Error(`Command "${command.command}" not found.`);
                }

                const args = JSON.parse(command.args);
                const result = await serviceFunction(args);

                await prisma.command.update({
                    where: { id: command.id },
                    data: {
                        status: CommandStatus.COMPLETED,
                        completedAt: new Date(),
                        output: JSON.stringify(result.treatedResult, null, 2),
                        rawOutput: result.rawOutput,
                        executedCommand: result.executedCommand,
                    },
                });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                await prisma.command.update({
                    where: { id: command.id },
                    data: {
                        status: CommandStatus.FAILED,
                        completedAt: new Date(),
                        output: errorMessage,
                    },
                });
            }

            this.isProcessing = false;
            this.processQueue();
        } else {
            this.isProcessing = false;
        }
    }
}

export default CommandProcessor.getInstance();
