export type GenericObjectType<T> = {
    get: () => T | undefined;
    set: (v?: T) => void;
}