import { QueueService } from './services/QueueService';
import { TerminalService } from './services/TerminalService';
import { AmassService } from './services/tools/AmassService';
import { SubfinderService } from './services/tools/SubfinderService';
import { NslookupService } from './services/tools/NslookupService';
import { NmapService } from './services/tools/NmapService';
import { Enum4linuxService } from './services/tools/Enum4linuxService';
import EventBus from './EventBus';

class NanoSystem {
  private static instance: NanoSystem;
  private services: any[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): NanoSystem {
    if (!NanoSystem.instance) {
      NanoSystem.instance = new NanoSystem();
    }
    return NanoSystem.instance;
  }

  public initialize() {
    if (this.initialized) return;

    console.log('[NanoSystem] Initializing services...');

    this.services.push(new QueueService());
    this.services.push(new TerminalService());
    this.services.push(new AmassService());
    this.services.push(new SubfinderService());
    this.services.push(new NslookupService());
    this.services.push(new NmapService());
    this.services.push(new Enum4linuxService());

    this.initialized = true;
    console.log('[NanoSystem] Services initialized.');
  }

  public process() {
    if (!this.initialized) {
      this.initialize();
    }
    // Kick the queue
    EventBus.emit('KICK_QUEUE');
  }
}

export default NanoSystem.getInstance();
