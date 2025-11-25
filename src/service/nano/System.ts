import EventBus from './EventBus';
import { registeredServices } from './registry';
import { NanoService } from './NanoService';

class NanoSystem {
  private static instance: NanoSystem;
  private services: NanoService[] = [];
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

    console.log('[NanoSystem] Initializing services from registry...');

    // Load services from registry
    this.services = [...registeredServices];

    // Initialize each service
    this.services.forEach(service => {
      service.initialize();
      console.log(`[NanoSystem] Service '${service.name}' initialized.`);
    });

    this.initialized = true;
    console.log(`[NanoSystem] All ${this.services.length} services initialized.`);
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
