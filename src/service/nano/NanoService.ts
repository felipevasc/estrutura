import EventBus from './EventBus';

export abstract class NanoService {
  protected bus = EventBus;

  constructor() {
    this.initialize();
  }

  abstract initialize(): void;

  protected log(message: string, ...args: any[]) {
    console.log(`[${this.constructor.name}] ${message}`, ...args);
  }

  protected error(message: string, ...args: any[]) {
    console.error(`[${this.constructor.name}] ${message}`, ...args);
  }
}
