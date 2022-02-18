/**
 * TODO Docs
 *
 * @module StashModule
 *
 */

//  *
//  * ---
//  * TODO: A thing to change
//  * may be adding a parameter in the constructor of the Stash to
//  * allow to link a custom `writable()` compatible with svelte's `Writable`. This may be needed anyways,
//  * i don't know how advanced is the tree shaking that Vite/Svelte has, maybe depending as whether having svelte
//  * here will bloat something.

import { writable } from "svelte/store";
import {
    StashImplementation,
    StashRecord,
    StashEventDetail,
    StashEvent,
    AvailableEvents,
    StashOwnData,
} from "./types";
import { clone, petrify } from "./util";
import localforage from "localforage";
import PackageConfig from "../package.json";
import { v4 as UUID } from "uuid";

// Local config
localforage.config({
    name: "Stash",
    version: parseInt(PackageConfig.version.split(".").join(""), 10),
    description: "Stash is a simple key-value store for Svelte applications.",
});

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
 * @param own Object containing the stash's metadata. See {@link StashOwnData}
 * @param events The events object contains all available events as of {@link stashEvent}.
 * This events can be fired arbitrarily by calling `dispatchEvent(Stash.events["eventName"])`.
 * @param entries The entries object contains all entries of the stash, and is initialized as an empty object,
 * given is a readonly property.
 * @param add Adds a new entry to the stash.
 * @param deleteMutable Mutably deletes a entry from the stash.
 * @param set Sets a new value for an entry already present in the stash.
 * @param transform Transforms a value for an entry already present in the stash.
 * @param sync Syncs the stash with local storage.
 * @param tick Increases the step counter.
 *
 *
 * ---
 *
 * @usage
 *
 * ```typescript
 * const myStash = new Stash();
 * const myLocalStash = new Stash(stashMetadata);
 * ```
 *
 * ---
 *
 * @properties
 *
 * #### `events`: See {@link Stash.events}.
 * #### `entries`: See {@link Stash.entries}.
 * #### `own`: See {@link StashOwnData}.
 *
 * ---
 *
 * @methods
 *
 * #### `add()`: See {@link Stash.add}.
 * #### `deleteMutable()`: See {@link Stash.deleteMutable}.
 * #### `transform()`: See {@link Stash.transform}.
 * #### `set()`: See {@link Stash.set}.
 * #### `sync()`: See {@link Stash.sync}.
 * #### `tick()`: See {@link Stash.tick}.
 *
 * ---
 *
 * @details
 *
 * While you can create any custom stash you fancy, it is recommended to use the included exposed stashes `sessionStash`
 * and `localStash`. This is because they are already implemented and are ready to use, otherwise you'd have to setup,
 * configuration and initialization.
 */
export class Stash implements StashImplementation {
    /**
     * @param own Object containing the stash's metadata.
     * @param own.persistence The persistence parameter defines if the stash should be persisted to local storage.
     * @param own.stashName The name of the stash, to be used as key for syncing with local storage.
     * @param own.stashId A UUID v4 string to uniquely identify the stash.
     * @param own.initTime The UNIX timestamp given by `Date()` when the stash was initialized.
     * @param events The events object contains all available events as of {@link stashEvent}.
     * This events can be fired arbitrarily by calling `dispatchEvent(Stash.events["eventName"])`.
     * @param entries The entries object contains all entries of the stash, and is initialized as an empty object,
     * given is a readonly property. See {@link StashRecord}.
     *
     * ---
     *
     * @usage
     *
     * ```typescript
     * const myStash = new Stash();
     * const myLocalStash = new Stash("local");
     * ```
     *
     * The rest of the parameters are optional, and have sane defaults, but if you need to specify:
     *
     * ```typescript
     * const stashMetadata = {
     *  persistence: "session",
     *  stashId: UUID(),
     *  stashName: "sessionStash",
     *  initTime: new Date().toDateString(),
     *  isCustom: false,
     *  step: {
     *      current: 0,
     *      initial: 0,
     *  },
     * };
     * const myStash = new Stash(stashMetadata);
     * ```
     */
    constructor(
        public readonly own: StashOwnData = {
            persistence: "session",
            stashId: UUID(),
            stashName: "sessionStash",
            initTime: new Date().toDateString(),
            isCustom: false,
            step: {
                current: 0,
                initial: 0,
            },
        }
    ) {
        this.entries = {};
        this.events = {
            add: (entryId: string, step: number) =>
                stashEvent({
                    stash: this.own.stashId,
                    action: "add",
                    entryId,
                    step,
                }),
            transform: (entryId: string, step: number) =>
                stashEvent({
                    stash: this.own.stashId,
                    action: "transform",
                    entryId,
                    step,
                }),
            set: (entryId: string, step: number) =>
                stashEvent({
                    stash: this.own.stashId,
                    action: "set",
                    entryId,
                    step,
                }),
            deleteMutable: (entryId: string, step: number) =>
                stashEvent({
                    stash: this.own.stashId,
                    action: "deleteMutable",
                    entryId,
                    step,
                }),
        };
        petrify(this.events);
    }

    /**
     * @param id The ID of the entry to add. The ID is used as a key to access the entry.
     * @param entryInitializer The initializer is an object containing the initial value of the entry. This value is
     * used to construct a {@link StashRecord} object with a `writable()` store. (We don't use `readable()`
     * because the value should be accessed with the `.value` property of the entry.)
     * @template T The type of the value to add.
     * @usage
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
     * @details
     *
     * Entries are readonly, so you can't directly change, reassign or extend them; if you want to modify the value
     * of an entry, you have to use the `set()` or `transform()` methods.
     *
     * The data added to every entry will be deep cloned before building the entry, and the initializer deep frozen,
     * to avoid side effects and unexpected gotchas.
     * Keep in mind the mutability is only reserved to the `.store` property, and not directly.
     *
     * ---
     *
     * @flow
     *
     * ```mermaid
     * flowchart TD
     * subgraph add ["<tt>add<T>(id: string, initializer: T): void</tt>"]
     * 	add1("Increase the ticker\nusing <tt>Stash.tick()</tt>") --> add2
     * 	add2("Clone the initializer") --> add3
     * 	subgraph add3 ["Use the initializer to setup the entry"]
     * 	    direction TB
     * 	    add3setup1("<tt>.latest</tt> will be initialized to\nthe current 'global' step") -->    add3setup2
     * 	    add3setup2("<tt>.data.initializer.step</tt> will\nbe a clone of the current 'global' step") --> add3setup3
     * 	    add3setup3("<tt>.data.initializer.timestamp</tt> will\ncontain the DateString of now") --> add3setup4
     * 	    add3setup4("<tt>.data.initializer.value</tt> will\nbe the cloned initializer") --> add3setup5
     * 	    add3setup5("<tt>.value</tt> will be a function pointing\nto <tt>.history.initializer.value</tt>") --> add3setup6
     * 	    add3setup6("<tt>.store</tt> will contain a <tt>writable()</tt>\npointing exactly like <tt>.value</tt>") --> add3setup7
     *      add3setup7("<tt>.history</tt> will contain a function\npointing exactly like <tt>.value</tt>")
     * 	end
     * 	add3 --> add4
     * 	add4("Add the entry to this <tt>Stash</tt>") --> add5
     * 	add5("Mark the entry as readonly") --> add6
     * 	add6("Create the subscription (for the <tt>.store</tt>)\nfor updating the pointer (<tt>.value</tt>)") --> add7
     * 	add7("Dispatch the corresponding <tt>CustomEvent</tt>") --> add7setup1
     * 	add7setup1("Sync this </tt>Stash</tt> with local storage if needed")
     * end
     * %% --- Styling ---
     * class add3 subGraph1
     * classDef subGraph1 fill:#f1fcf1,stroke:#afa,stroke-width:1px,color:#151;
     * ```
     *
     */
    add<T>(id: string, entryInitializer: T): void {
        // Increase the ticker
        this.tick();

        // Get a immutable, reference-less initializer.
        const copiedInitializer = petrify(entryInitializer);

        // Setup the entry and include it in the stash
        const storeEntry: StashRecord<T> = {
            latest: this.own.step.current,
            records: {
                initializer: {
                    step: clone(this.own.step.current),
                    timestamp: new Date().toDateString(),
                    value: copiedInitializer,
                },
            },
            value: () => storeEntry.records.initializer.value,
            store: writable(() => storeEntry.records.initializer.value),
            history: [() => storeEntry.records.initializer.value],
        };
        this.entries[id] = storeEntry;

        // Mark the entry as readonly (shallow)
        Object.defineProperty(this.entries, id, {
            writable: false,
            configurable: true,
        });

        // Create the subscription that will update the pointer to the real value
        this.entries[id].store.subscribe((updatedValue) => {
            this.entries[id].value = updatedValue;
        });

        // Dispatch the event and sync
        dispatchEvent(this.events.add(id, this.own.step.current));
        this.sync();
    }

    /**
     * @param id The ID of the entry to set. The ID is used as a key to access the entry.
     * @param value The value to set the entry to. This value _has_ to be the same type of the initializer.
     * The initializer is accessible at all times in the `entries` property, so you can always check what type it is.
     * @template T The type of the value to set.
     *
     * ---
     *
     * @usage
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
     * @details
     *
     * Entries are set via appending a new node to the records of the entry, and updating the
     * pointer with the `update()` writable store method:
     *
     * ```typescript
     * store.update(() => newPointer);
     * ```
     *
     * This means that using this method for setting the value will completely replace the contents in the new
     * record, so if you want to just make a modification to an existing value, without losing any references
     * (the record is still deep copied, but its internal references may persist if you use a function) use
     * the `transform()` method instead, and pass the state and data that should not lose references using that
     * transform function.
     */
    set<T>(id: string, value: T): void {
        // Setup the pointer function
        const newPointer = () =>
            this.entries[id].records[`val${this.own.step.current}`].value;

        //Update pointer
        this.entries[id].store.update(() => newPointer);

        // Update pointer target
        this.entries[id].records[`val${this.own.step.current}`] = petrify({
            value,
            timestamp: new Date().toDateString(),
            step: parseInt(this.own.step.current.toString(), 10),
        });

        // Update history
        this.entries[id].history.unshift(newPointer);

        // Tick the stash, dispatch events and sync
        this.tick();
        dispatchEvent(this.events.set(id, this.own.step.current));
        this.sync();
    }

    /**
     * @param id The ID of the entry to transform. The ID is used as a key to access the entry.
     * @param transformation The transformation function to apply to the entry.
     * This function is called with the current value of the entry as only parameter.
     * @template T The type of the value to transform.
     *
     * ---
     *
     * @usage
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
     *
     * ---
     *
     * @details
     *
     * Entries are transformed via appending a new node to the records of the entry, and updating the
     * pointer with the `update()` writable store method:
     *
     * ```typescript
     * store.update(() => newPointer);
     * ```
     *
     * This will deep clone the record, but the if you pass the state and data that should not lose references
     * using the transform function, the new data will pass through it and conserve references.
     *
     * Make note that you can't transform data into a different type.
     *
     * ```typescript
     * type transformation = (data: T) => T
     * ```
     */
    transform<T>(id: string, transformation: (data: T) => T): void {
        // Setup the pointer function
        const newPointer = () =>
            this.entries[id].records[`val${this.own.step.current}`].value;

        //Update pointer
        this.entries[id].store.update(() => newPointer);

        // Update pointer target
        this.entries[id].records[`val${this.own.step.current}`] = petrify({
            // HACK Add type parsing to the system
            value: transformation(this.entries[id].value() as T),
            timestamp: new Date().toDateString(),
            step: parseInt(this.own.step.current.toString(), 10),
        });

        // Update history
        this.entries[id].history.unshift(newPointer);

        // Tick the stash, dispatch events and sync
        this.tick();
        dispatchEvent(this.events.transform(id, this.own.step.current));
        this.sync();
    }

    /**
     * ### About:
     *
     * @param id The ID of the entry to delete. The ID is used as a key to access the entry.
     *
     * ---
     *
     * @usage
     *
     * Choose the ID of the entry to delete.
     *
     * ```typescript
     * myStash.entries.myString.value; // "Hello World"
     * myStash.delete("myString");
     * myStash.entries.myString?.value; // undefined
     * ```
     *
     * ---
     *
     * @details
     *
     * Deletions are made using the `delete` operator.
     *
     * Yes, we lied, this is not truly immutable, you can destroy entries as always. Try not to, tho.
     *
     * The thing is, you see, the immutable bits are the _contents_ of the entries, not the entries themselves.
     * Those are just readonly.
     */
    deleteMutable(id: string): void {
        delete this.entries[id];
        dispatchEvent(this.events.deleteMutable(id, this.own.step.current));
        this.sync();
    }

    /**
     * @usage
     *
     * Call the function. It will check the structure and config of the stash and behave accordingly.
     *
     * ```typescript
     * myStash.sync();
     * ```
     *
     * ---
     *
     * @details
     *
     * The stash will sync to a local storage entry with the key given by `.own.stashName`
     */
    sync(): void {
        if (this.own.persistence === "local") {
            localforage.setItem(
                this.own.isCustom ? this.own.stashId : "localStash",
                this
            );
        }
    }

    /**
     * This property allows you to interact with the stash entries, each entry being a {@link StashRecord}.
     *
     * ---
     *
     * @usage
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
     * @details
     *
     * Accessing the store directly is mostly not needed, as the Stash provides methods for handling data.
     */
    readonly entries: Record<string, StashRecord<unknown>>;

    /**
     * This property implements {@link AvailableEvents}, which in turn serves to
     * implement {@link AvailableEventNames}
     *
     * Basically, it allows to dispatch a `CustomEvent` with the name of the used method, and the store data.
     *
     * Check out both of the relevant interfaces.
     */
    events: AvailableEvents;

    /**
     * TODO Docs
     */
    tick(): void {
        Object.defineProperty(this.own, "step", {
            writable: true,
        });
        const newData: StashOwnData["step"] = {
            current: this.own.step.current + 1,
            initial: this.own.step.initial,
        };
        this.own.step = newData;
        Object.defineProperty(this.own, "step", {
            writable: false,
        });
    }
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
                step: {
                    current: 0,
                    initial: 0,
                },
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
        step: {
            current: 0,
            initial: 0,
        },
    });
    localStash.sync();
};
