/**
 * TODO Docs
 *
 * @module TypesModule
 */

import type { Immutable } from "immer";
import type { Writable } from "svelte/store";

/**
 * ### About
 * ---
 *
 * @typeParam T - The type of the value to be stored. If this data will be serialized into local storage, it should be
 * one of the [types supported by localForage](https://localforage.github.io/localForage/#data-api-setitem).
 * @param value Immutable value of this entry.
 * @param timestamp DateString representing the creation date of this entry.
 * @param step The integer value that represents this entry.
 */
export type EntryRecord<T> = {
    value: T;
    timestamp: string;
    step: number;
};

/**
 * ### About
 * ---
 *
 * @typeParam T - The type of the value to be stored. If this data will be serialized into local storage, it should be
 * one of the [types supported by localForage](https://localforage.github.io/localForage/#data-api-setitem).
 * @param records `readonly` object that contains every value recorded and some metadata. See {@link EntryRecord}.
 * This object is not immutable, only `readonly`, because we need to append any new value as a property.
 * @param history Array containing the complete history of all the pointers, for easy access to previous values.
 * Its data is added by unshifting, so you can always get the most recent value by accessing the first element.
 * `.history[0]` is exactly the same as `.value`, `.value` exists for comfort.
 * @param value Reference to the current value according to the latest step of the entry.
 * @param store This parameter represents the immutable [svelte writable store](https://svelte.dev/docs/store#writable_store) that will
 * be used to store the data in the stash.
 * @param latest Number that represents the latest step of the entry.
 */
export type StashRecord<T> = {
    value: () => Immutable<T>;
    readonly records: {
        initializer: Immutable<EntryRecord<T>>;
        [x: string]: Immutable<EntryRecord<T>>;
    };
    readonly history: StashRecord<T>["value"][];
    store: Immutable<Writable<StashRecord<T>["value"]>>;
    latest: number;
};

/**
 * TODO Docs
 */
export interface StashEventDetail {
    /**
     * TODO Docs
     */
    stash: string;

    /**
     * TODO Docs
     */
    action: keyof CoreStashImplementation;

    /**
     * TODO Docs
     */
    entryId: string;

    /**
     * TODO Docs
     */
    step: number;
}

/**
 * TODO Docs
 */
export interface StashEvent extends CustomEvent<StashEventDetail> {}

/**
 * TODO Docs
 */
export type AvailableEvents = {
    [K in keyof CoreStashImplementation]: (
        entryId: string,
        step: number
    ) => StashEvent;
};

/**
 * TODO Docs
 */
export interface StashOwnData {
    readonly persistence: "local" | "session";
    readonly stashName: string;
    readonly isCustom: boolean;
    readonly stashId: string;
    readonly initTime: string;
    step: Immutable<{
        current: number;
        initial: number;
    }>;
}

/**
 * TODO Docs
 */
export interface CoreStashImplementation {
    /**
     * TODO Docs
     */
    add<T>(id: string, entry: T): void;

    /**
     * TODO Docs
     */
    set<T>(id: string, value: T): void;

    /**
     * TODO Docs
     */
    transform<T>(id: string, transformation: (data: T) => T): void;

    /**
     * TODO Docs
     */
    deleteMutable(id: string): void;
}

/**
 * TODO Docs
 */
export interface StashImplementation extends CoreStashImplementation {
    /**
     * TODO Docs
     */
    sync(): void;

    /**
     * TODO Docs
     */
    entries: Record<string, StashRecord<unknown>>;

    /**
     * TODO Docs
     */
    own?: StashOwnData;

    /**
     * TODO Docs
     */
    events: AvailableEvents;
}
