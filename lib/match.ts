import {v4} from "node-uuid";
import {IUser} from "../types/nodebb";

const jsonToXml = require("xml2json");

function toArray(m: any): any[] {
    if (!m) {
        return [];
    }
    if (!Array.isArray(m)) {
        return [m];
    }
    return m;
}

export enum Natosymbol {
    inf = "inf",
    motor_inf = "motor_inf",
    mech_inf = "mech_inf",
    armor = "armor",
    recon = "recon",
    air = "air",
    plane = "plane",
    uav = "uav",
    med = "med",
    art = "art",
    mortar = "mortar",
    hq = "hq",
    support = "support",
    maint = "maint",
    none = "",
}

export enum Side {
    blufor = "blufor",
    opfor = "opfor",
    independent = "independent",
    civilian = "civilian",
    unknown = "unknown",
    none = "",
}

export interface IReservable {
    "reserved-for": string|undefined;
    getReservations(): string[];
}

interface ISlotContainer {
    slot: Slot[];
    slottedPlayerCount: number;
    getSlots(): Slot[];
    updateSlottedPlayerCount(): void;
}
interface IFireteamContainer {
    fireteam: Fireteam[];
}
interface ISquadContainer {
    squad: Squad[];
}
interface IPlatoonContainer {
    platoon: Platoon[];
}
interface ICompanyContainer {
    company: Company[];
}
interface ISelfContainedUnit extends IReservable {
    side: Side;
    callsign: string;
    frequency: string;
    natosymbol: Natosymbol;
    vehicletype: string;
}

export interface IMatchOutputUser extends IUser {
    groups: string[];
    groupTitle?: string;
}

export interface IMatchInputUser {
    uid: number;
}

class BasicSelfContainedUnit implements ISelfContainedUnit {

    public side: Side = Side.none;
    public callsign: string|undefined;
    public frequency: string|undefined;
    public natosymbol: Natosymbol = Natosymbol.inf;
    public vehicletype: string|undefined;
    public "reserved-for": string|undefined;
    public "min-slotted-player-count": number|undefined;
    constructor(dto?: any) {
        if (!dto) {
            return;
        }

        ["callsign", "frequency", "vehicletype", "reserved-for"]
            .forEach((name) => this[name] = dto[name]);
        ["min-slotted-player-count"]
            .forEach((name) => this[name] = Number(dto[name]) || undefined);
        this.setEnum("side", dto, Side);
        this.setEnum("natosymbol", dto, Natosymbol);
    }

    public getReservations(): string[] {
        const v = this["reserved-for"] || "";
        return v.split(",").filter(Boolean);
    }

    protected setEnum(name: string, dto: any, enumeration) {
        if (!dto[name]) {
            return;
        }
        if (!(dto[name] in enumeration)) {
            throw new Error(`invalid value ${dto[name]} in enum ${JSON.stringify(enumeration)}`);
        }

        this[name] = dto[name];
    }
}

export class Slot implements IReservable {
    public readonly uuid: string|undefined;
    public shortcode: string|undefined;
    public description: string|undefined;
    public "reserved-for": string|undefined;
    public "min-slotted-player-count": number|undefined;
    public user?: IMatchInputUser|IMatchOutputUser;
    constructor(dto?: any) {
        if (!dto) {
            this.uuid = v4();
            return;
        }
        this.shortcode = dto.shortcode;
        this.description = dto.description;
        this["reserved-for"] = dto["reserved-for"];
        ["min-slotted-player-count"]
            .forEach((name) => this[name] = Number(dto[name]) || undefined);
        this.uuid = dto.uuid || v4();
    }

    public getReservations(): string[] {
        const v = this["reserved-for"] || "";
        return v.split(",").filter(Boolean);
    }

    public setReservations(reservedFor: string[]): void {
        this["reserved-for"] = reservedFor.join("");
    }
}

export class Fireteam implements IReservable, ISlotContainer {
    public slot: Slot[] = [];
    public "reserved-for": string|undefined;
    public "min-slotted-player-count": number|undefined;
    public slottedPlayerCount: number;

    constructor(dto?: any) {
        if (!dto) {
            return;
        }
        this.slot = toArray(dto.slot).map((obj) => new Slot(obj));
        this["reserved-for"] = dto["reserved-for"];
        ["min-slotted-player-count"]
            .forEach((name) => this[name] = Number(dto[name]) || undefined);
    }

    public getSlots(): Slot[] {
        return this.slot;
    }

    public getReservations(): string[] {
        const v = this["reserved-for"] || "";
        return v.split(",").filter(Boolean);
    }

    public updateSlottedPlayerCount(): void {
        this.slottedPlayerCount = this.getSlots().filter(s => s.user).length;
    }
}
export class Squad extends BasicSelfContainedUnit implements IFireteamContainer, ISlotContainer {
    public slot: Slot[] = [];
    public fireteam: Fireteam[] = [];
    public slottedPlayerCount: number;

    constructor(dto?: any) {
        super(dto);
        if (!dto) {
            return;
        }
        this.slot = toArray(dto.slot).map((obj) => new Slot(obj));
        this.fireteam = toArray(dto.fireteam).map((obj) => new Fireteam(obj));
    }

    public getSlots(): Slot[] {
        return this.fireteam.reduce((slots, ft) => slots.concat(ft.getSlots()), this.slot);
    }

    public updateSlottedPlayerCount(): void {
        this.slottedPlayerCount = this.getSlots().filter(s => s.user).length;
    }

    public getSlotContainer(): ISlotContainer[] {
        return this.fireteam;
    }
}
export class Platoon extends Squad implements ISquadContainer, IFireteamContainer, ISlotContainer, ISelfContainedUnit {
    public squad: Squad[] = [];

    constructor(dto?: any) {
        super(dto);
        if (!dto) {
            return;
        }

        this.squad = toArray(dto.squad).map((obj) => new Squad(obj));
    }

    public getSlots(): Slot[] {
       return this.squad.reduce((slots, squad) => slots.concat(squad.getSlots()), super.getSlots());
    }

    public getSlotContainer(): ISlotContainer[] {
        return this.squad
            .reduce((slotContainer, squad) => slotContainer.concat(squad.getSlotContainer()), super.getSlotContainer());
    }
}

export class Company
    extends Platoon
    implements IPlatoonContainer, ISquadContainer, IFireteamContainer, ISlotContainer, ISelfContainedUnit {

    public platoon: Platoon[] = [];

    constructor(dto?: any) {
        super(dto);
        if (!dto) {
            return;
        }

        this.platoon = toArray(dto.platoon).map((obj) => new Platoon(obj));
    }

    public getSlots(): Slot[] {
        return this.platoon.reduce((slots, platoon) => slots.concat(platoon.getSlots()), super.getSlots());
    }

    public getSlotContainer(): ISlotContainer[] {
        return this.platoon
            .reduce((slotContainer, squad) => slotContainer.concat(squad.getSlotContainer()), super.getSlotContainer());
    }
}

export class Match
    implements ISlotContainer, IFireteamContainer, ISquadContainer, IPlatoonContainer, ICompanyContainer, IReservable {

    private static xmlHead(): string {
        return '<?xml version="1.0" encoding="UTF-8"?>';
    }

    public uuid: string;

    public company: Company[] = [];
    public platoon: Platoon[] = [];
    public squad: Squad[] = [];
    public fireteam: Fireteam[] = [];
    public slot: Slot[] = [];
    public slottedPlayerCount: number;
    public "reserved-for": string|undefined;

    constructor(dto?: any) {
        if (!dto) {
            this.uuid = v4();
            return;
        }

        this.uuid = dto.uuid || v4();
        this.slot = toArray(dto.slot).map((obj) => new Slot(obj));
        this.fireteam = toArray(dto.fireteam).map((obj) => new Fireteam(obj));
        this.squad = toArray(dto.squad).map((obj) => new Squad(obj));
        this.platoon = toArray(dto.platoon).map((obj) => new Platoon(obj));
        this.company = toArray(dto.company).map((obj) => new Company(obj));
        this["reserved-for"] = dto["reserved-for"];

        this.validateSlotUuidUniqueness();
    }

    public toJson(): any {
        return JSON.parse(JSON.stringify(this));
    }

    public updateSlottedPlayerCount(): void {
        [this.fireteam, this.squad, this.platoon, this.company]
            .forEach(units => units.forEach(fireteam => fireteam.updateSlottedPlayerCount()));

        this.slottedPlayerCount = this.getSlots().filter(s => s.user).length;
    }

    public getReservations(): string[] {
        const v = this["reserved-for"] || "";
        return v.split(",").filter(Boolean);
    }

    public toXml(): string {
        const xmlHead = Match.xmlHead();
        const innerXml = jsonToXml.toXml({match: this});
        return `${xmlHead}${innerXml}`;
    }

    public getSlots(): Slot[] {
        const subUnits: ISlotContainer[][] = [this.fireteam, this.platoon, this.company];
        return subUnits.reduce((slots, units) => {
            return units.reduce((unitSlots, unit) => unitSlots.concat(unit.getSlots()), slots);
        }, this.slot);
    }

    public getSlot(uuid: string): Slot {
        return this.getSlots().find(s => s.uuid === uuid);
    }

    private validateSlotUuidUniqueness(): void {
        const uuids = this.getSlots().map(s => s.uuid);
        // I could work with new Set().size !== uuids.length here, but then I wouldnt get the offending string…
        // … that's why iterating is better here:
        uuids.forEach((uuid, idx) => {
            const firstOccurrence = uuids.indexOf(uuid);
            if (firstOccurrence !== idx) {
                throw new Error(`non-unique uuid '${uuid}'`);
            }
        });
    }
}

export class Event {
    public tid: number;
    public match: Match[];

    constructor(dto: any) {
        if (!dto) {
            return;
        }
        this.tid = dto.tid;
        this.match = (dto.match || []).map(o => new Match(o));
    }
}
