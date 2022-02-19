import { produce, Immutable, freeze, castImmutable } from "immer";

/**
 * TODO Docs
 */
export const clone = <T>(source: T): Immutable<T> => {
    return castImmutable(produce(freeze(source, true), (draft) => {}));
};

/**
 * TODO Docs
 */
export const transform = <T>(
    source: T,
    transform: (source: T) => T
): Immutable<T> => {
    return castImmutable(produce(freeze(source, true), transform));
};

/**
 * TODO Docs
 */
export const cleanupKey = (key: string) =>
    key
        .trim()
        .replace(/\n+/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^\d\w\-_]/g, "");
