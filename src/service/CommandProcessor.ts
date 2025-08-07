import prisma from '@/database';
import { CommandStatus } from '@prisma/client';
import { iniciarEnumeracaoAmass } from '@/service/tools/domain/amass';
import { executarSubfinder } from '@/service/tools/domain/subfinder';
import { executarNslookup } from '@/service/tools/domain/nslookup';
import { executarNmap } from '@/service/tools/ip/nmap';
import { executarWhois } from '@/service/tools/ip/whois';
import { executarDnsrecon } from '@/service/tools/ip/dnsrecon';
import { executarWhatWeb } from '@/service/tools/ip/whatweb';
import { executarNikto } from '@/service/tools/ip/nikto';
import { executarFeroxbuster } from '@/service/tools/ip/feroxbuster';
import { executarTestssl } from '@/service/tools/ip/testssl';
import { executarNuclei } from '@/service/tools/ip/nuclei';
import { executarEnum4linux } from '@/service/tools/ip/enum4linux';
import { executarWebScreenshot } from '@/service/tools/ip/webscreenshot';

// A map to associate command names with their service functions.
const commandServiceMap: { [key: string]: (args: any) => Promise<any> } = {
    'amass': (args) => iniciarEnumeracaoAmass(args.idDominio),
    'subfinder': (args) => executarSubfinder(args.idDominio),
    'nslookup': (args) => executarNslookup(args.idDominio),
    'nmap': (args) => executarNmap(args.idIp),
    'whois': (args) => executarWhois(args.idIp),
    'dnsrecon': (args) => executarDnsrecon(args.idIp),
    'whatweb': (args) => executarWhatWeb(args.idIp),
    'nikto': (args) => executarNikto(args.idIp),
    'feroxbuster': (args) => executarFeroxbuster(args.idIp),
    'testssl': (args) => executarTestssl(args.idIp),
    'nuclei': (args) => executarNuclei(args.idIp),
    'enum4linux': (args) => executarEnum4linux(args.idIp),
    'webscreenshot': (args) => executarWebScreenshot(args.idIp),
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
