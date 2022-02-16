import { produce, Immutable, freeze } from "immer";

/**
 * TODO Docs
 */
export const clone = <T>(source: T): T => {
    return produce(source, (draftState) => {
        return draftState;
    });
};

/**
 * TODO Docs
 */
export const petrify = <T>(obj: T): Immutable<T> => {
    return freeze(clone(obj), true) as Immutable<T>;
};