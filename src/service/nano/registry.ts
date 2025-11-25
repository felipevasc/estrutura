import { NanoService } from './NanoService';
import { QueueService } from './services/QueueService';
import { TerminalService } from './services/TerminalService';
import { AmassService } from './services/tools/AmassService';
import { SubfinderService } from './services/tools/SubfinderService';
import { NslookupService } from './services/tools/NslookupService';
import { NmapService } from './services/tools/NmapService';
import { Enum4linuxService } from './services/tools/Enum4linuxService';
import { FfufService } from './services/tools/FfufService';
import HackedByService from './services/cti/HackedByService';
import PwnedByService from './services/cti/PwnedByService';

export const registeredServices: NanoService[] = [
    new QueueService(),
    new TerminalService(),
    new AmassService(),
    new SubfinderService(),
    new NslookupService(),
    new NmapService(),
    new Enum4linuxService(),
    new FfufService(),
    new HackedByService(),
    new PwnedByService(),
];
