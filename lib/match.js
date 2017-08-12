"use strict";
exports.__esModule = true;
var Slot = (function () {
    function Slot() {
    }
    return Slot;
}());
exports.Slot = Slot;
var Fireteam = (function () {
    function Fireteam() {
    }
    return Fireteam;
}());
exports.Fireteam = Fireteam;
var Squad = (function () {
    function Squad() {
    }
    return Squad;
}());
exports.Squad = Squad;
var Platoon = (function () {
    function Platoon() {
    }
    return Platoon;
}());
exports.Platoon = Platoon;
var Company = (function () {
    function Company() {
    }
    return Company;
}());
exports.Company = Company;
var Match = (function () {
    function Match(matchDto) {
        this.company = [];
        this.platoon = [];
        this.squad = [];
        this.fireteam = [];
        this.slot = [];
        if (!matchDto) {
            return;
        }
        var m = matchDto.company;
        if (m) {
            this.company = Match.toArray(m);
        }
    }
    Match.toArray = function (m) {
        if (!m.length) {
            m = [m];
        }
        return m;
    };
    return Match;
}());
exports.Match = Match;
//# sourceMappingURL=match.js.map