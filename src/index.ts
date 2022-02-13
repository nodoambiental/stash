import { writable } from "svelte/store";
import {
    StashImplementation,
    StashRecord,
    StashEventDetail,
    StashEvent,
    AvailableEvents,
} from "./types";
import localforage from "localforage";
import PackageConfig from "../package.json";
import { v4 as UUID } from "uuid";
// TODO Module docs

// Local config
localforage.config({
    name: "Stash",
    version: parseInt(PackageConfig.version.split(".").join(""), 10),
    description: "Stash is a simple key-value store for Svelte applications.",
});

export const stashEvent = (options: StashEventDetail): StashEvent =>
    new CustomEvent("stash", {
        detail: options,
        bubbles: true,
        composed: true,
        cancelable: false,
    });

/**
 * TODO Docs
 */
export class Stash implements StashImplementation {
    /**
     * TODO Docs
     */
    constructor(
        public readonly persistence: "local" | "session" = "session",
        public readonly stashId: string = UUID()
    ) {
        this.entries = {};
        this.stashId = stashId;
        this.events = {
            add: stashEvent({ stash: this.stashId, action: "add" }),
            transform: stashEvent({ stash: this.stashId, action: "transform" }),
            set: stashEvent({ stash: this.stashId, action: "set" }),
            remove: stashEvent({ stash: this.stashId, action: "remove" }),
            sync: stashEvent({ stash: this.stashId, action: "sync" }),
        };
    }

    /**
     * TODO Docs
     */
    add<T>(id: string, entryInitializer: T): void {
        const storeEntry: StashRecord<T> = {
            initializer: entryInitializer,
            value: entryInitializer,
            store: writable(entryInitializer),
        };
        this.entries[id] = storeEntry;
        this.entries[id].store.subscribe(
            (value) => (this.entries[id].value = value)
        );
        dispatchEvent(this.events.add);
        this.sync();
    }

    /**
     * TODO Docs
     */
    set<T>(id: string, value: T): void {
        this.entries[id].store.update(() => value);
        dispatchEvent(this.events.set);
        this.sync();
    }

    /**
     * TODO Docs
     */
    transform<T>(id: string, transformation: (data: T) => T): void {
        this.entries[id].store.set(transformation);
        dispatchEvent(this.events.transform);
        this.sync();
    }

    /**
     * TODO Docs
     */
    remove(id: string): void {
        delete this.entries[id];
        dispatchEvent(this.events.remove);
        this.sync();
    }

    /**
     * TODO Docs
     */
    sync(): void {
        if (this.persistence === "local") {
            localforage.setItem("localStash", this);
            dispatchEvent(this.events.sync);
        }
    }

    /**
     * TODO Docs
     */
    entries: Record<string, StashRecord<unknown>>;

    /**
     * TODO Docs
     */
    events: AvailableEvents;
}

/**
 * TODO Docs
 */
export const sessionStash = new Stash();

/**
 * TODO Docs
 */
export let localStash = new Stash("local");

/**
 * TODO Docs
 */
export const init = async (): Promise<void> => {
    sessionStash.add("initTime", new Date());
    // HACK We should be using a TS parsing library (like Zod) to test if the type is correct
    const init = (await localforage.getItem("localStash")) as Stash;
    if (init) {
        localStash = init ?? new Stash("local");
    }

    // TODO Add a listener to sync localStorage() with the global store
};
