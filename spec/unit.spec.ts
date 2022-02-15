// TODO Fix logging
// ! Fix local, it's completely broken
// TODO Module docs
// TODO Individual test docs

import { writable } from "svelte/store";
import jasmine from "jasmine";
import { init, sessionStash, localStash, purge } from "../src";
import chalk from "chalk";
chalk.level = 3;

/**
 * TODO Docs
 */
const log = (message: string, requiredLevel: "v" | "vv") => {
    if (requiredLevel === "v") {
        console.log(chalk.hex("#88b1c2")(message));
    } else if (requiredLevel === "vv") {
        console.log(chalk.hex("#9788c2")(message));
    }
};

// ------------------------------------------
//   ------------ Session Storage -------------
// ------------------------------------------

/**
 * TODO Docs
 */
describe("[Stash] (Session:Init)", () => {
    beforeAll(() => {
        init();
    });

    it("Should have a valid stash", () => {
        expect(sessionStash).toBeTruthy();
        //log(JSON.stringify(sessionStash), "vv");
    });

    it("Should have valid init time", () => {
        expect(sessionStash.own.initTime).toBeTruthy();
        expect(sessionStash.own.initTime).toBe(sessionStash.own.initTime);
        expect(sessionStash.own.initTime).toBeTruthy();
        expect(typeof sessionStash.own.initTime).toBe(typeof new Date());
        log(JSON.stringify(sessionStash.own.initTime), "v");
    });

    it("Should have a valid stash ID", () => {
        expect(sessionStash.own.stashId).toBeTruthy();
        expect(typeof sessionStash.own.stashId).toBe("string");
        //log(sessionStash.own.stashId, "v");
    });
});

/**
 * TODO Docs
 */
describe("[Stash] (Session:Add)", () => {
    beforeAll(() => {
        init();
    });

    afterAll(() => {
        purge();
    });

    it("Should add a value correctly", () => {
        const test = {
            stringProp: "test",
            objectProp: { data: true },
            numberProp: 10,
            booleanProp: true,
            arrayProp: [true],
        };

        const keys = Object.keys(test);

        Object.entries(test).forEach((testData, index) => {
            sessionStash.add(keys[index], testData);
            expect(typeof sessionStash.entries[keys[index]].value).toBe(
                typeof testData
            );
        });
    });

    it("Should not directly modify entries", () => {
        const test2 = {
            shallow: "test",
            deep: { data: true },
            deeper: { data: { data: true } },
            array: [true],
        };

        const keys = Object.keys(test2);

        Object.entries(test2).forEach((testData, index) => {
            let error = false;
            sessionStash.add(keys[index], testData);
            try {
                sessionStash.entries[keys[index]] = {
                    initializer: "",
                    store: writable(),
                    value: "",
                };
            } catch {
                error = true;
                expect(typeof sessionStash.entries[keys[index]].value).toBe(
                    typeof testData
                );
                expect(
                    typeof sessionStash.entries[keys[index]].initializer
                ).toBe(typeof testData);
            } finally {
                if (!error) {
                    fail();
                }
            }
        });
    });
});

// TODO [0/9]
// TODO describe tests for setting a value
// TODO describe tests for transforming a value
// TODO describe tests for deleting a value
// TODO describe tests for not adding a value that already exists
// TODO describe tests for checking data integrity on both read and modification
// TODO describe tests for correct type parsing of the data
// TODO describe tests for adding a value that was previously deleted
// TODO describe tests for every event firing correctly
// TODO describe tests for preserving type on a stored value (not change the type of a already stored value)
// TODO What other tests remain?

// ---------------------------------------
//   ----------- Local Storage -------------
// ---------------------------------------

/**
 * TODO Docs
 */
describe("[Stash] (Local:Init)", () => {
    beforeAll(() => {
        init();
    });

    it("Should have a valid stash", () => {
        expect(localStash).toBeTruthy();
        //log(JSON.stringify(localStash), "vv");
    });

    it("Should have valid init time", () => {
        expect(localStash.own.initTime).toBeTruthy();
        expect(localStash.own.initTime).toBeTruthy();
        expect(localStash.own.initTime).toBe(localStash.own.initTime);
        expect(typeof localStash.own.initTime).toBe(typeof new Date());
        //log(localStash.own.initTime as string, "v");
    });

    it("Should have a valid stash ID", () => {
        expect(localStash.own.stashId).toBeTruthy();
        expect(typeof localStash.own.stashId).toBe("string");
        //log(localStash.own.stashId, "v");
    });
});

// TODO [0/14]
// TODO describe tests for adding values
// TODO describe tests for setting a value
// TODO describe tests for transforming a value
// TODO describe tests for deleting a value
// TODO describe tests for not adding a value that already exists
// TODO describe tests for checking data preservation on reinitialization
// TODO describe tests for checking data integrity on both read and modification
// TODO describe tests for checking data integrity on localforge
// TODO describe tests for checking correct "database" sync
// TODO describe tests for correct type parsing of the data
// TODO describe tests for checking type integrity on parsing data retrieved from localforage
// TODO describe tests for adding a value that was previously deleted
// TODO describe tests for every event firing correctly
// TODO describe tests for preserving type on a stored value (not change the type of a already stored value)
// TODO What other tests remain?
