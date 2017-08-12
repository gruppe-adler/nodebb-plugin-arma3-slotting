import {Match, Company} from './match';

describe("Match", function () {
    describe('constructor', function () {

        it("initializes all units", function () {
            const m = new Match();

            expect(m.platoon).toEqual([]);
            expect(m.company).toEqual([]);
            expect(m.squad).toEqual([]);
            expect(m.fireteam).toEqual([]);
            expect(m.slot).toEqual([]);
        });

        it('adds single company as array', function () {
            const m = new Match({company: {}});
            expect(m.company).toBeTruthy();
            expect(m.company.length).toEqual(1);
            expect(m.company[0]).toBeTruthy();
        })
    });
});
    


