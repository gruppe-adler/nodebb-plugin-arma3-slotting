"use strict";
exports.__esModule = true;
var match_1 = require("./match");
describe("Match", function () {
    describe('constructor', function () {
        it("initializes all units", function () {
            var m = new match_1.Match();
            expect(m.platoon).toEqual([]);
            expect(m.company).toEqual([]);
            expect(m.squad).toEqual([]);
            expect(m.fireteam).toEqual([]);
            expect(m.slot).toEqual([]);
        });
        it('adds single company as array', function () {
            var m = new match_1.Match({ company: {} });
            expect(m.company).toBeTruthy();
            expect(m.company.length).toEqual(1);
            expect(m.company[0]).toBeTruthy();
        });
    });
});
//# sourceMappingURL=match-spec.js.map