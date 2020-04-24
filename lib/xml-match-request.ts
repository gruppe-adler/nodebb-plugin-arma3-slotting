import {Match} from "./match";
import toJson from "./xml2json";

async function requestBodyToMatchJson(body: any): Promise<any> {
    if (typeof body === "string") { // assume XMLv
        body = (await toJson(body) as {match:Match}).match[0];
    }

    return body;
}

export class XmlMatchRequest {
    private readonly body: any;
    private readonly matchid: string
    private tid: number;
    constructor(req: {body: any, params: {tid: string, matchid?: string}}) {
        this.body = req.body
        this.tid = Number(req.params.tid)
        this.matchid = req.params.matchid
    }

    public async getMatch(): Promise<Match> {
        const matchDto = await requestBodyToMatchJson(this.body)
        if (this.matchid) {
            if (matchDto.uuid && matchDto.uuid !== this.matchid) {
                throw new Error("uuid in request and body differ. aaargs.");
            } else {
                matchDto.uuid = this.matchid
            }
        }

        return new Match(matchDto);
    }
}
