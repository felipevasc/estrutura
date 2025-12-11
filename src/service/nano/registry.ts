import { NanoService } from './NanoService';
import { QueueService } from './services/QueueService';
import { TerminalService } from './services/TerminalService';
import { AmassService } from './services/tools/AmassService';
import { SubfinderService } from './services/tools/SubfinderService';
import { NslookupService } from './services/tools/NslookupService';
import { NmapService } from './services/tools/NmapService';
import { Enum4linuxService } from './services/tools/Enum4linuxService';
import { FfufService } from './services/tools/FfufService';
import { RustscanService } from './services/tools/RustscanService';
import { GobusterService } from './services/tools/GobusterService';
import DefaceDorkService from './services/cti/DefaceDorkService';
import { TakedownService } from "./services/cti/TakedownService";
import DefaceForumZoneXsecService from "./services/cti/DefaceForumZoneXsecService";
import DefaceForumHackDbService from "./services/cti/DefaceForumHackDbService";
import { FontesDadosVazamentoService } from './services/cti/vazamentoSenhas/FontesDadosVazamentoService';
import { BuscaAtivaVazamentoService } from './services/cti/vazamentoSenhas/BuscaAtivaVazamentoService';
import { TratamentoVazamentoService } from './services/cti/vazamentoSenhas/TratamentoVazamentoService';
import { BaseVazamentosService } from './services/cti/vazamentoSenhas/BaseVazamentosService';
import { ComunicacaoVazamentosService } from './services/cti/vazamentoSenhas/ComunicacaoVazamentosService';
import { WhatwebService } from './services/tools/WhatwebService';
import { DnsenumService } from './services/tools/DnsenumService';
import PhishingDnstwistService from './services/cti/PhishingDnstwistService';
import PhishingCatcherService from './services/cti/PhishingCatcherService';
import PhishingCrtshService from './services/cti/PhishingCrtshService';
import PhishingVerificacaoService from './services/cti/PhishingVerificacaoService';
import PhishingAnaliseService from './services/cti/PhishingAnaliseService';
import PhishingCapturaService from './services/cti/PhishingCapturaService';
import { WgetRecursivoService } from './services/tools/WgetRecursivoService';
import DefaceCapturaService from './services/cti/DefaceCapturaService';
import InfoDisclosureDorkService from './services/cti/InfoDisclosureDorkService';
import { WhoisDominioService } from './services/tools/WhoisDominioService';
import InfoDisclosureCodigoService from './services/cti/InfoDisclosureCodigoService';
import InfoDisclosurePasteService from './services/cti/InfoDisclosurePasteService';
import { DetectorServicoService } from './services/tools/DetectorServicoService';
import { IdentificarLinguagemService } from './services/tools/IdentificarLinguagemService';
import { IdentificarFrameworkService } from './services/tools/IdentificarFrameworkService';
import ReconCapturaService from './services/tools/ReconCapturaService';

export const registeredServices: NanoService[] = [
    new QueueService(),
    new TerminalService(),
    new AmassService(),
    new SubfinderService(),
    new NslookupService(),
    new NmapService(),
    new RustscanService(),
    new GobusterService(),
    new WgetRecursivoService(),
    new WhatwebService(),
    new DetectorServicoService(),
    new IdentificarLinguagemService(),
    new IdentificarFrameworkService(),
    new ReconCapturaService(),
    new DnsenumService(),
    new Enum4linuxService(),
    new FfufService(),
    new WhoisDominioService(),
    new DefaceDorkService(),
    new DefaceForumZoneXsecService(),
    new DefaceForumHackDbService(),
    new DefaceCapturaService(),
    new InfoDisclosureDorkService(),
    new InfoDisclosureCodigoService(),
    new InfoDisclosurePasteService(),
    new PhishingDnstwistService(),
    new PhishingCatcherService(),
    new PhishingCrtshService(),
    new PhishingVerificacaoService(),
    new PhishingAnaliseService(),
    new PhishingCapturaService(),
    new TakedownService(),
    new FontesDadosVazamentoService(),
    new BuscaAtivaVazamentoService(),
    new TratamentoVazamentoService(),
    new BaseVazamentosService(),
    new ComunicacaoVazamentosService(),
];
