/**
 * TODO Docs
 *
 * @module StashModule
 */

import { writable } from "svelte/store";
import {
    StashImplementation,
    StashRecord,
    StashEventDetail,
    StashEvent,
    AvailableEvents,
    AvailableEventNames,
    StashOwnData,
} from "./types";
import localforage from "localforage";
import PackageConfig from "../package.json";
import { v4 as UUID } from "uuid";

// Local config
localforage.config({
    name: "Stash",
    version: parseInt(PackageConfig.version.split(".").join(""), 10),
    description: "Stash is a simple key-value store for Svelte applications.",
});

// from https://learntypescript.dev/10/l5-deep-immutable
function deepFreeze<T>(obj: T) {
    var propNames = Object.getOwnPropertyNames(obj);
    for (let name of propNames) {
        let value = (obj as any)[name];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }
    return Object.freeze(obj);
}

/**
 * TODO Docs
 */
export const stashEvent = (options: StashEventDetail): StashEvent =>
    new CustomEvent("stash", {
        detail: options,
        bubbles: true,
        composed: true,
        cancelable: false,
    });

/**
 * Stash
 * ---
 *
 * @param own Object containing the stash's metadata. See {@link StashOwnData}
 * @param events The events object contains all available events as of {@link stashEvent}.
 * This events can be fired arbitrarily by calling `dispatchEvent(Stash.events["eventName"])`.
 * @param entries The entries object contains all entries of the stash, and is initialized as an empty object,
 * given is a readonly property.
 * @param add Adds a value to the stash.
 * @param remove Removes a value from the stash.
 * @param set Sets a value alreasy present in the stash.
 * @param transform Transforms a value already present in the stash.
 * @param sync Syncs the stash with local storage.
 *
 *
 * ---
 *
 * ### Usage:
 *
 * ```typescript
 * const myStash = new Stash();
 * const myLocalStash = new Stash("local");
 * ```
 *
 * The rest of the parameters are optional, and have sane defaults, but if you need to specify:
 *
 * ```typescript
 * const myStash = new Stash("session", "my-stash-id", Date.now());
 * ```
 *
 * ---
 *
 * ### Properties:
 *
 * #### `events`: See {@link Stash.events}
 * #### `entries`: See {@link Stash.entries}
 * #### `own`: See {@link StashOwnData}
 *
 * ---
 *
 * ### Methods:
 *
 * #### `add()`: See {@link Stash.add}
 * #### `remove()`: See {@link Stash.remove}
 * #### `sync()`: See {@link Stash.sync}
 * #### `transform()`: See {@link Stash.transform}
 * #### `set()`: See {@link Stash.set}
 *
 * ---
 *
 * While you create any custom stash you fancy, it is recommended to use the included exposed stashes `sessionStash`
 * and `localStash`. This is because
 */
export class Stash implements StashImplementation {
    /**
     * Stash Constructor
     * ---
     *
     * @param own Object containing the stash's metadata.
     * @param own.persistence The persistence parameter defines if the stash should be persisted to local storage.
     * @param own.stashName The name of the stash, to be used as key for syncing with local storage.
     * @param own.stashId A UUID v4 string to uniquely identify the stash.
     * @param own.initTime The UNIX timestamp given by `Date()` when the stash was initialized.
     * @param events The events object contains all available events as of {@link stashEvent}.
     * This events can be fired arbitrarily by calling `dispatchEvent(Stash.events["eventName"])`.
     * @param entries The entries object contains all entries of the stash, and is initialized as an empty object,
     * given is a readonly property.
     *
     * ---
     *
     * ### Usage:
     *
     * ```typescript
     * const myStash = new Stash();
     * const myLocalStash = new Stash("local");
     * ```
     *
     * The rest of the parameters are optional, and have sane defaults, but if you need to specify:
     *
     * ```typescript
     * const myStash = new Stash("session", "my-stash-id", Date.now());
     * ```
     */
    constructor(
        public readonly own: StashOwnData = {
            persistence: "session",
            stashId: UUID(),
            stashName: "sessionStash",
            initTime: new Date().toDateString(),
            isCustom: false,
        }
    ) {
        this.entries = {};
        this.events = {
            add: stashEvent({ stash: this.own.stashId, action: "add" }),
            transform: stashEvent({
                stash: this.own.stashId,
                action: "transform",
            }),
            set: stashEvent({ stash: this.own.stashId, action: "set" }),
            remove: stashEvent({ stash: this.own.stashId, action: "remove" }),
            sync: stashEvent({ stash: this.own.stashId, action: "sync" }),
        };
        deepFreeze(this.own);
        deepFreeze(this.events);
    }

    /**
     * Stash `add` method
     * ---
     *
     * @param id The ID of the entry to add. The ID is used as a key to access the entry.
     * @param entryInitializer The initializer is an object containing the initial value of the entry. This value is
     * used to construct a {@link StashRecord} object with a `writable()` store. (We don't use `readable()`
     * because the value should be accessed with the `.value` property of the entry.)
     * @template T The type of the value to add.
     *
     * ---
     *
     * ### Usage:
     *
     * Use a easy and unique ID and add the value you want as a second paramenter.
     *
     * ```typescript
     * const myStash = new Stash();
     *
     * myStash.add("myObject", { value: "Hello World!" });
     * myStash.add("myString", "Hello World!");
     * ```
     *
     * Entries can be accessed with the `.value` property.
     *
     * ```typescript
     * myStash.entries.myObject.value; // {value: "Hello World!"}
     * myStash.entries.myString.value; // "Hello World!"
     * ```
     *
     * ---
     *
     * Entries are readonly, so you can't directly change, reassign or extend them; if you want to modify the value
     * of an entry, you have to use the `set()` or `transform()` methods. Deletion is made with the `remove()` method.
     */
    add<T>(id: string, entryInitializer: T): void {
        const storeEntry: StashRecord<T> = {
            initializer: entryInitializer,
            value: entryInitializer,
            store: writable(entryInitializer),
        };
        this.entries[id] = storeEntry;
        Object.defineProperty(this.entries, id, {
            writable: false,
            configurable: true,
        });
        this.entries[id].store.subscribe(
            (value) => (this.entries[id].value = value)
        );
        dispatchEvent(this.events.add);
        this.sync();
    }

    /**
     * Stash `set` method
     * ---
     *
     * @param id The ID of the entry to set. The ID is used as a key to access the entry.
     * @param value The value to set the entry to. This value _has_ to be the same type of the initializer.
     * The initializer is accessible at all times in the `entries` property, so you can always check what type it is.
     * @template T The type of the value to set.
     *
     * ---
     *
     * ### Usage:
     *
     * Choose the ID and set the value you want as a second paramenter.
     *
     * ```typescript
     * myStash.entries.myString.value; // "Hello World!"
     * myStash.set("myString", "Bye World!");
     * myStash.entries.myString.value; // "Bye World!"
     * ```
     *
     * ---
     *
     * Entries are set with the `update()` writable store method:
     *
     * ```typescript
     * store.update(() => value);
     * ```
     *
     * This means that setting the value will completely overwrite whatever was there previously, so if you want to just
     * make a modification to an existing value, use the `transform()` method instead.
     */
    set<T>(id: string, value: T): void {
        this.entries[id].store.update(() => value);
        dispatchEvent(this.events.set);
        this.sync();
    }

    /**
     * Stash `transform` method
     * ---
     *
     * @param id The ID of the entry to transform. The ID is used as a key to access the entry.
     * @param transformation The transformation function to apply to the entry.
     * This function is called with the current value of the entry as only parameter.
     * @template T The type of the value to transform.
     *
     * ---
     *
     * ### Usage:
     *
     * Choose the ID and set the trasnformation function (preferable arrow) you want as a second paramenter.
     *
     * ```typescript
     * const myTransform = (value: string) => `${value}!`;
     *
     * myStash.entries.myString.value; // "Hello World"
     * myStash.transform("myString", myTransform);
     * myStash.entries.myString.value; // "Hello World!"
     *
     * myStash.transform("myString", (value) => `${value}!!1!11`);
     * myStash.entries.myString.value; // "Hello World!!!1!11"
     * ```
     * ---
     *
     * Transformations always should respect the type of the current value:
     *
     * ```typescript
     * type transformation = (data: T) => T
     * ```
     */
    transform<T>(id: string, transformation: (data: T) => T): void {
        this.entries[id].store.set(transformation);
        dispatchEvent(this.events.transform);
        this.sync();
    }

    /**
     * Stash `remove` method
     * ---
     *
     * @param id The ID of the entry to delete. The ID is used as a key to access the entry.
     *
     * ---
     *
     * ### Usage:
     *
     * Choose the ID of the entry to delete.
     *
     * ```typescript
     *
     *
     * myStash.entries.myString.value; // "Hello World"
     * myStash.delete("myString");
     * myStash.entries.myString?.value; // undefined
     *
     * ```
     * ---
     *
     * Deletions are made using the `delete` operator.
     */
    remove(id: string): void {
        delete this.entries[id];
        dispatchEvent(this.events.remove);
        this.sync();
    }

    /**
     * Stash `sync` method
     * ---
     *
     * ### Usage:
     *
     * Call the function. It will check the structure and config of the stash and behave accordingly.
     *
     * ```typescript
     * myStash.sync();
     * ```
     * ---
     *
     * The stash will sync to a local storage entry with the key given by `.own.stashName`
     */
    sync(): void {
        if (this.own.persistence === "local") {
            localforage.setItem(
                this.own.isCustom ? this.own.stashId : "localStash",
                this
            );
            dispatchEvent(this.events.sync);
        }
    }

    /**
     * Stash entries
     * ---
     *
     * This property implements {@link StashRecord}.
     *
     * It has tree possible sub-properties:
     *
     * - `.value`: The value of the entry.
     * - `.initializer`: The initializer (original value) of the entry.
     * - `.store`: The proper `writable()` store.
     *
     * ### Usage:
     *
     * To retrieve a value, use the `.value` property.
     *
     * ```typescript
     * myStash.entries.myString.value; // "Hello World!"
     * ```
     *
     * To retrieve the original value, use the `.initializer` property.
     *
     * ```typescript
     * myStash.entries.myString.initializer; // "Hello World!"
     * ```
     *
     * To manually handle the store at a lower level, use the `.store` property.
     *
     * ```typescript
     * myStash.entries.myString.store.update(() => "Bye World!"); // Manually set the value to "Bye World!"
     * ```
     *
     * ---
     *
     * Accessing the store directly is mostly not needed, as the Stash provides methods for handling data.
     */
    readonly entries: Record<string, StashRecord<unknown>>;

    /**
     * Stash events
     * ---
     *
     * This property implements {@link AvailableEvents}, which in turn serves to
     * implement {@link AvailableEventNames}
     *
     * Basically, it allows to dispatch a `CustomEvent` with the name of the used method, and the store data.
     *
     * Check out both of the relevant interfaces.
     */
    events: AvailableEvents;
}

/**
 * TODO Docs
 */
export let sessionStash: Stash;

/**
 * TODO Docs
 */
export let localStash: Stash;

/**
 * TODO Docs
 */
export const init = async (name: string = "localStash"): Promise<void> => {
    // HACK We should be using a TS parsing library (like Zod) to test if the type is correct
    sessionStash = new Stash();
    const init = (await localforage.getItem(name)) as Stash;
    if (init) {
        localStash =
            init ??
            new Stash({
                persistence: "local",
                isCustom: name !== "localStash" ? true : false,
                stashName: name,
                stashId: UUID(),
                initTime: new Date().toDateString(),
            });
    }
};

/**
 * TODO Docs
 */
export const purge = (): void => {
    sessionStash = new Stash();
    localStash = new Stash({
        persistence: "local",
        isCustom: false,
        stashName: "localStash",
        stashId: UUID(),
        initTime: new Date().toDateString(),
    });
    localStash.sync();
};
