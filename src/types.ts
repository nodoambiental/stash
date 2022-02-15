import type { Writable } from "svelte/store";

// TODO Module docs

/**
 * TODO Docs
 */
export interface StashRecord<T> {
    /**
     * TODO Docs
     */
    readonly initializer: T;

    /**
     * TODO Docs
     */
    store: Writable<T>;

    /**
     * TODO Docs
     */
    value: T;
}

/**
 * TODO Docs
 */
export enum AvailableEventNames {
    add = "add",
    remove = "remove",
    set = "set",
    transform = "transform",
    sync = "sync",
}

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
    action: keyof typeof AvailableEventNames;
}

/**
 * TODO Docs
 */
export interface StashEvent extends CustomEvent<StashEventDetail> {}

/**
 * TODO Docs
 */
export type AvailableEvents = {
    [K in AvailableEventNames]: StashEvent;
};

/**
 * TODO Docs
 */
export interface StashImplementation {
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
    remove(id: string): void;

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
    persistence: "local" | "session";

    /**
     * TODO Docs
     */
    stashId: string;

    /**
     * TODO Docs
     */
    initTime: Date;

    /**
     * TODO Docs
     */
    events: AvailableEvents;
}
