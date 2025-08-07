export type NmapArgs = {
    idIp: string;
    ipAddress: string;
};

export type AmassArgs = {
    idDominio: string;
};

export type SubfinderArgs = {
    idDominio: string;
};

export type NslookupArgs = {
    idDominio: string;
};

export type CommandArgs = NmapArgs | AmassArgs | SubfinderArgs | NslookupArgs;
