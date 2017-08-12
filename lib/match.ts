export class Slot {}
export class Fireteam {}
export class Squad {}
export class Platoon {}
export class Company {}

export class Match {
    public company: Company[] = [];
    public platoon: Platoon[] = [];
    public squad: Squad[] = [];
    public fireteam: Fireteam[] = [];
    public slot: Slot[] = [];

    constructor(matchDto?: any) {
        if (!matchDto) {
            return;
        }

        let m = matchDto.company;
        if (m) {
            this.company = Match.toArray(m);
        }
    }

    private static toArray(m: any): any[] {
        if (!m.length) {
            m = [m];
        }
        return m
    }
}
