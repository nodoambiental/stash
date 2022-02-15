// TODO Fix logging
// TODO Fix localStash having undefined .initTime

import { writable } from "svelte/store";
import jasmine from "jasmine";
import { init, sessionStash, localStash, purge } from "../src";
import chalk from "chalk";
chalk.level = 3;

const log = (message: string, requiredLevel: "v" | "vv") => {
    if (requiredLevel === "v") {
        console.log(chalk.hex("#88b1c2")(message));
    } else if (requiredLevel === "vv") {
        console.log(chalk.hex("#9788c2")(message));
    }
};

// ------------------------------------------
// ------------ Session Storage -------------
// ------------------------------------------

describe("[Stash] (Session:Init)", () => {
    beforeAll(() => {
        init();
    });

    it("Should have a valid stash", () => {
        expect(sessionStash).toBeTruthy();
        //log(JSON.stringify(sessionStash), "vv");
    });

    it("Should have valid init time", () => {
        expect(sessionStash.initTime).toBeTruthy();
        expect(sessionStash.initTime).toBe(sessionStash.initTime);
        expect(sessionStash.initTime).toBeTruthy();
        expect(typeof sessionStash.initTime).toBe(typeof new Date());
        log(JSON.stringify(sessionStash.initTime), "v");
    });

    it("Should have a valid stash ID", () => {
        expect(sessionStash.stashId).toBeTruthy();
        expect(typeof sessionStash.stashId).toBe("string");
        //log(sessionStash.stashId, "v");
    });
});

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

// ---------------------------------------
// ----------- Local Storage -------------
// ---------------------------------------

describe("[Stash] (Local:Init)", () => {
    beforeAll(() => {
        init();
    });

    it("Should have a valid stash", () => {
        expect(localStash).toBeTruthy();
        //log(JSON.stringify(localStash), "vv");
    });

    it("Should have valid init time", () => {
        expect(localStash.initTime).toBeTruthy(); // FIXME This is undefined
        expect(localStash.initTime).toBeTruthy();
        expect(localStash.initTime).toBe(localStash.initTime);
        expect(typeof localStash.initTime).toBe(typeof new Date());
        //log(localStash.initTime as string, "v");
    });

    it("Should have a valid stash ID", () => {
        expect(localStash.stashId).toBeTruthy();
        expect(typeof localStash.stashId).toBe("string");
        //log(localStash.stashId, "v");
    });
});
