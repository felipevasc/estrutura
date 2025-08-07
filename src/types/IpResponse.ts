import { Dominio, Rede, Porta, NmapScan, WhoisInfo, DnsreconScan, WhatWebResult, NiktoScan, FeroxbusterScan, TestsslScan, NucleiScan, Enum4linuxScan, WebScreenshot } from "@prisma/client";

export type IpResponse = {
    id: number;
    endereco: string;
    projetoId: number;
    dominios: Dominio[];
    redes: Rede[];
    portas?: Porta[];
    nmapScans?: NmapScan[];
    whoisInfos?: WhoisInfo[];
    dnsreconScans?: DnsreconScan[];
    whatWebResults?: WhatWebResult[];
    niktoScans?: NiktoScan[];
    feroxbusterScans?: FeroxbusterScan[];
    testsslScans?: TestsslScan[];
    nucleiScans?: NucleiScan[];
    enum4linuxScans?: Enum4linuxScan[];
    webScreenshots?: WebScreenshot[];
};