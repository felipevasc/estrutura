import { NextResponse } from "next/server";
import prisma from "@/database";
import NanoSystem from "@/service/nano/System";
import { AiCommandSuggestion } from "@/types/AiChat";

const COMMAND_MAP = {
    AMASS: { type: 'domain', queue: 'amass' },
    SUBFINDER: { type: 'domain', queue: 'subfinder' },
    NSLOOKUP: { type: 'domain', queue: 'nslookup' },
    NMAP: { type: 'ip', queue: 'nmap' },
    ENUM4LINUX: { type: 'ip', queue: 'enum4linux' },
    FFUF: { type: 'any', queue: 'ffuf' },
} as const;

type CommandKey = keyof typeof COMMAND_MAP;

const normalizeValue = (value?: unknown) => {
    if (typeof value === 'string') return value.trim();
    return undefined;
};

const extractValue = (suggestion: AiCommandSuggestion, keys: string[]): string | undefined => {
    const source = suggestion as Record<string, unknown>;
    for (const key of keys) {
        const value = normalizeValue(source[key]);
        if (value) return value;
    }
    return undefined;
};

const findDomainByValue = async (projectId: number, rawValue?: string) => {
    if (!rawValue) return null;
    return prisma.dominio.findFirst({ where: { projetoId: projectId, endereco: rawValue } });
};

const findIpByValue = async (projectId: number, rawValue?: string) => {
    if (!rawValue) return null;
    return prisma.ip.findFirst({ where: { projetoId: projectId, endereco: rawValue } });
};

export async function POST(request: Request) {
    try {
        const { projectId, suggestion } = await request.json() as { projectId?: number, suggestion?: AiCommandSuggestion };

        if (!projectId || !suggestion) {
            return NextResponse.json({ message: "projectId e suggestion são obrigatórios" }, { status: 400 });
        }

        const comandoBruto = suggestion.COMANDO || (suggestion as Record<string, unknown>).comando;
        const commandKey = comandoBruto?.toString().toUpperCase() as CommandKey;
        const mapped = commandKey ? COMMAND_MAP[commandKey] : undefined;

        if (!mapped) {
            return NextResponse.json({ message: `Comando não suportado: ${comandoBruto}` }, { status: 400 });
        }

        let args: any = {};

        if (mapped.type === 'domain') {
            const domainValue = extractValue(suggestion, ['DOMINIO', 'dominio', 'ALVO', 'alvo', 'PARAMETRO1', 'PARAMETRO']);
            const dominio = await findDomainByValue(projectId, domainValue);
            if (!dominio) {
                return NextResponse.json({ message: `Domínio não encontrado: ${domainValue}` }, { status: 404 });
            }
            args = { idDominio: dominio.id.toString() };
        } else if (mapped.type === 'ip') {
            const ipValue = extractValue(suggestion, ['IP', 'ip', 'ALVO', 'alvo', 'PARAMETRO1', 'PARAMETRO']);
            const ip = await findIpByValue(projectId, ipValue);
            if (!ip) {
                return NextResponse.json({ message: `IP não encontrado: ${ipValue}` }, { status: 404 });
            }
            args = { idIp: ip.id.toString() };
        } else if (mapped.type === 'any') {
            const domainValue = extractValue(suggestion, ['DOMINIO', 'dominio', 'ALVO', 'alvo', 'PARAMETRO1', 'PARAMETRO']);
            const ipValue = extractValue(suggestion, ['IP', 'ip', 'ALVO', 'alvo', 'PARAMETRO1', 'PARAMETRO']);

            const dominio = await findDomainByValue(projectId, domainValue);
            const ip = dominio ? null : await findIpByValue(projectId, ipValue);

            if (!dominio && !ip) {
                return NextResponse.json({ message: `Alvo não encontrado: ${domainValue || ipValue}` }, { status: 404 });
            }

            args = dominio ? { idDominio: dominio.id.toString() } : { idIp: ip!.id.toString() };
        }

        const command = await prisma.command.create({
            data: {
                command: mapped.queue,
                args: JSON.stringify(args),
                projectId,
            }
        });

        NanoSystem.process();

        return NextResponse.json({ message: 'Comando adicionado à fila', command });
    } catch (error: unknown) {
        console.error("[IA Command]", error);
        const message = error instanceof Error ? error.message : 'Erro ao processar comando';
        return NextResponse.json({ message }, { status: 500 });
    }
}
