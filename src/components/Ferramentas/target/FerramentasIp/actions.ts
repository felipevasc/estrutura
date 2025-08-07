"use client";

import { message } from 'antd';

const enqueueCommand = async (command: string, args: any, projectId: number) => {
    try {
        const response = await fetch('/api/v1/queue/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                command,
                args,
                projectId,
            }),
        });

        if (response.ok) {
            message.success(`Comando "${command}" adicionado à fila.`);
        } else {
            const errorData = await response.json();
            message.error(`Erro ao adicionar comando: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        message.error('Erro de rede ao tentar adicionar comando.');
    }
};

export const executarNmapAction = (idIp: number, projectId: number) => enqueueCommand('nmap', { idIp }, projectId);
export const executarWhoisAction = (idIp: number, projectId: number) => enqueueCommand('whois', { idIp }, projectId);
export const executarDnsreconAction = (idIp: number, projectId: number) => enqueueCommand('dnsrecon', { idIp }, projectId);
export const executarWhatWebAction = (idIp: number, projectId: number) => enqueueCommand('whatweb', { idIp }, projectId);
export const executarNiktoAction = (idIp: number, projectId: number) => enqueueCommand('nikto', { idIp }, projectId);
export const executarFeroxbusterAction = (idIp: number, projectId: number) => enqueueCommand('feroxbuster', { idIp }, projectId);
export const executarTestsslAction = (idIp: number, projectId: number) => enqueueCommand('testssl', { idIp }, projectId);
export const executarNucleiAction = (idIp: number, projectId: number) => enqueueCommand('nuclei', { idIp }, projectId);
export const executarEnum4linuxAction = (idIp: number, projectId: number) => enqueueCommand('enum4linux', { idIp }, projectId);
export const executarWebScreenshotAction = (idIp: number, projectId: number) => enqueueCommand('webscreenshot', { idIp }, projectId);
