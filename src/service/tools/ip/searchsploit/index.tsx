import prisma from '@/database';
import { Terminal } from '@/service/terminal';

interface ExploitResult {
    edbId: string;
    description: string;
    path: string;
}

const parseSearchsploitOutput = (output: string): ExploitResult[] => {
    try {
        const json = JSON.parse(output);
        return json.RESULTS_EXPLOIT.map((item: any) => ({
            edbId: item['EDB-ID'],
            description: item.Title,
            path: item.Path,
        }));
    } catch (e) {
        console.error("[Serviço Searchsploit] Erro ao analisar a saída JSON:", e);
        return [];
    }
};

export const executarSearchsploit = async (idIp: string) => {
    const ipRecord = await prisma.ip.findFirst({
        where: { id: Number(idIp) },
        include: { portas: true }
    });

    if (!ipRecord) {
        throw new Error(`IP com id ${idIp} não encontrado.`);
    }

    const services = ipRecord.portas
        .filter(p => p.status === 'open' && p.servico)
        .map(p => ({
            portaId: p.id,
            query: `${p.servico} ${p.versao || ''}`.trim()
        }));

    if (services.length === 0) {
        return {
            executedCommand: 'N/A',
            rawOutput: 'Nenhum serviço identificado para pesquisar exploits.',
            treatedResult: [],
        };
    }

    let allRawOutput = '';
    let allTreatedResults: { service: string, exploits: ExploitResult[] }[] = [];
    let allExecutedCommands = '';

    for (const service of services) {
        const comando = 'searchsploit';
        const searchTerms = service.query.split(' ');
        const argumentos = ['--json', ...searchTerms];

        const executedCommand = `${comando} ${argumentos.join(' ')}`;
        allExecutedCommands += executedCommand + '\n';
        console.log(`[Serviço Searchsploit] Pesquisando por: "${service.query}".`);

        const resultado = await Terminal(comando, argumentos);
        const rawOutput = resultado.saidaComando ?? '';
        allRawOutput += `\n--- Output for "${service.query}" ---\n` + rawOutput;

        const exploits = parseSearchsploitOutput(rawOutput);
        allTreatedResults.push({ service: service.query, exploits });

        if (exploits.length > 0) {
            const transactionPromises = exploits.map(exploit =>
                prisma.exploit.upsert({
                    where: { edbId: exploit.edbId },
                    update: {
                        description: exploit.description,
                        path: exploit.path,
                        portaId: service.portaId, // Update the port if found via another service
                    },
                    create: {
                        edbId: exploit.edbId,
                        description: exploit.description,
                        path: exploit.path,
                        portaId: service.portaId,
                    }
                })
            );
            await prisma.$transaction(transactionPromises);
        }
    }

    console.log(`[Serviço Searchsploit] Pesquisa de exploits concluída para o IP ${ipRecord.endereco}.`);

    return {
        executedCommand: allExecutedCommands.trim(),
        rawOutput: allRawOutput.trim(),
        treatedResult: allTreatedResults,
    };
};
