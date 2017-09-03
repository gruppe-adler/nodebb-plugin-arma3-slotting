"use strict";

import {Match, Natosymbol, Slot, Squad} from "./match";
import {readFileSync} from "fs";

function assertDeepEqual(a, b, path?: string) {
    path = path || "";
    if (Array.isArray(a)) {
        return a.forEach((aN, idx) => assertDeepEqual(a[idx], b[idx], [path, idx].join(".")));
    }
    if (!a || typeof a !== "object") {
        return expect(a).toBe(b, "at path " + path);
    }
    if (!b) {
        return fail("B not defined at path " + path);
    }
    return Object
        .keys(a)
        .sort()
        .forEach((key) => assertDeepEqual(a[key], b[key], [path, key].join(".")));
}

describe("Match", function () {

    function getComposedMatch(): Match {
        return new Match({
            company: {
                platoon: {
                    squad: [{
                        fireteam: [{
                            slot: {"reserved-for": "foo", "uuid": "1"},
                        }],
                    }],
                },
            },
            uuid: "1",
        });
    }

    describe("constructor", function () {

        it("initializes all units", function () {
            const m = new Match();

            expect(m.platoon).toEqual([]);
            expect(m.company).toEqual([]);
            expect(m.squad).toEqual([]);
            expect(m.fireteam).toEqual([]);
            expect(m.slot).toEqual([]);
        });

        ["company", "platoon", "squad", "fireteam", "slot"].forEach(function (unitName: string) {
            it(`adds single ${unitName} as array`, function () {
                const m = new Match({[unitName]: {}});
                expect(m[unitName]).toBeTruthy();
                expect(m[unitName].length).toEqual(1);
                expect(m[unitName][0]).toBeTruthy();
            });
        });

        ["company", "platoon", "squad", "fireteam", "slot"].forEach(function (unitName: string) {
            it(`adds passed ${unitName} array`, function () {
                const m = new Match({[unitName]: [{}, {}]});
                expect(m[unitName]).toBeTruthy();
                expect(m[unitName].length).toEqual(2);
                expect(m[unitName][0]).toBeTruthy();
                expect(m[unitName][1]).toBeTruthy();
            });
        });

        it("composes tree down to slot level", function () {
            const m = getComposedMatch();

            expect(m.company[0].platoon[0].squad[0].fireteam[0].slot[0]["reserved-for"]).toEqual("foo");
        });
    });
    describe("toJson", function () {
        it("correctly serializes empty match", function () {
            expect(
                (new Match({uuid: "1"})).toJson(),
            ).toEqual(
                {
                    "company": [],
                    "fireteam": [],
                    "platoon": [],
                    "reserved-for": "",
                    "slot": [],
                    "squad": [],
                    "uuid": "1",
                },
            );
        });
        it("is not totally bonkers. testing a thing that failed for some reason", function () {
            const matchInDb = JSON.parse(readFileSync(__dirname + "/match-spec-example.json").toString());

            const matchModel = new Match(matchInDb);
            expect(matchModel.company.length).toBe(2);
            expect(matchModel.company[0].slot.length).toBe(0);
            expect(matchModel.company[0].fireteam.length).toBe(0);
            expect(matchModel.company[0].squad[0].slot.length).toBe(2);
        });
        it("correctly serializes inner stuff", function () {
            const match = getComposedMatch();
            assertDeepEqual(
                match.toJson(),
                {
                    "company": [{
                        "callsign": "",
                        "fireteam": [],
                        "frequency": "",
                        "natosymbol": "inf",
                        "platoon": [{
                            "callsign": "",
                            "fireteam": [],
                            "frequency": "",
                            "natosymbol": "inf",
                            "reserved-for": "",
                            "side": "",
                            "slot": [],
                            "squad": [{
                                "callsign": "",
                                "fireteam": [{
                                    "callsign": "",
                                    "frequency": "",
                                    "natosymbol": "inf",
                                    "reserved-for": "",
                                    "slot": [{
                                        "description": "",
                                        "reserved-for": "foo",
                                        "shortcode": "",
                                        "uuid": "1",
                                    }],
                                    "vehicletype": "",
                                }],
                                "frequency": "",
                                "natosymbol": "inf",
                                "reserved-for": "",
                                "side": "",
                                "slot": [],
                                "vehicletype": "",
                            }],
                            "vehicletype": "",
                        }],
                        "reserved-for": "",
                        "side": "",
                        "slot": [],
                        "squad": [],
                        "vehicletype": "",
                    },
                    ],
                    "fireteam": [],
                    "platoon": [],
                    "reserved-for": "",
                    "slot": [],
                    "squad": [],
                    "uuid": "1",
                });
        });
    });
    describe("toXml", function () {
        it("correctly serializes empty match", function () {
            const m = new Match();
            expect(m.toXml()).toBe(`<?xml version="1.0" encoding="UTF-8"?><match uuid="${m.uuid}"></match>`);
        });
    });
    describe("getSlots", function () {
        it("returns own slots", function () {
            const match = (new Match({slot: [{uuid: "1"}, {uuid: "2"}]}));

            expect(match.getSlots().length).toEqual(2);
            expect(match.getSlots().find(s => s.uuid === "1")).toBeTruthy();
            expect(match.getSlots().find(s => s.uuid === "2")).toBeTruthy();
        });

        it("recursively returns all slots", function () {
            const match = (new Match(
                {
                    company: [{platoon: [{squad: [{fireteam: [{slot: [{uuid: "2"}]}]}]}]}],
                    slot: [{uuid: "1"}],
                    uuid: "1",
                },
            ));

            expect(match.getSlots().length).toEqual(2);
            expect(match.getSlots().find(s => s.uuid === "1")).toBeTruthy();
            expect(match.getSlots().find(s => s.uuid === "2")).toBeTruthy();
        });
    });
});

describe("Squad", function () {
    describe("constructor", function () {
        it("sets natosymbol", function () {
            const s = new Squad({
                natosymbol: "mech_inf",
            });

            expect(s.natosymbol).toBe(Natosymbol.mech_inf);
        });

        it("hmmm if you try to set an invalid symbol???", function () {
            expect(function () {
                const x = new Squad({
                    natosymbol: "foo",
                });
            }).toThrowError(Error);
        });
    });
});

describe("Slot", function () {
    it("initializes reserved-for to empty array", function () {
        const s = new Slot();
        expect(s.getReservations()).toEqual([]);
    });
    it("initializes reserved-for with empty string to empty array", function () {
        const s = new Slot({"reserved-for": ""});
        expect(s.getReservations()).toEqual([]);
    });
    it("initializes reserved-for correctly with array", function () {
        const s = new Slot({"reserved-for": "a,b"});
        expect(s.getReservations()).toEqual(["a", "b"]);
    });
});
