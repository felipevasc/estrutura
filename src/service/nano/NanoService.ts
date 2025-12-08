import EventBus from './EventBus';

export abstract class NanoService {
  protected bus = EventBus;
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract initialize(): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected listen(event: string, callback: (...args: any[]) => void) {
    this.bus.on(event, callback);
  }

  protected log(message: string, ...args: unknown[]) {
    console.log(`[${this.constructor.name}] ${message}`, ...args);
  }

  protected error(message: string, ...args: unknown[]) {
    console.error(`[${this.constructor.name}] ${message}`, ...args);
  }
}
