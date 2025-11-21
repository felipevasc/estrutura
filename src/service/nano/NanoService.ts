import EventBus from './EventBus';

export abstract class NanoService {
  protected bus = EventBus;

  constructor() {
    this.initialize();
  }

  abstract initialize(): void;

  protected listen(event: string, callback: (...args: any[]) => void) {
    this.bus.on(event, callback);
  }

  protected log(message: string, ...args: any[]) {
    console.log(`[${this.constructor.name}] ${message}`, ...args);
  }

  protected error(message: string, ...args: any[]) {
    console.error(`[${this.constructor.name}] ${message}`, ...args);
  }
}
