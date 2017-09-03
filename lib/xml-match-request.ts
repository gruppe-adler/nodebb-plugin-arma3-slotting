import {Match} from "./match";
const xml2json = require("xml2json") as { toJson: (xml: any, conf: any) => any, toXml: (obj: any) => string };

function requestBodyToMatchJson(body: any): any {
    if (typeof body === "string") { // assume XML
        body = xml2json.toJson(body, {object: true}).match;
    }

    return body;
}

export class XmlMatchRequest {
    private body: any;
    private tid: number;
    constructor(req: {body: any, params: {tid: number, matchid?: string}}) {
        this.tid = req.params.tid;

        this.body = requestBodyToMatchJson(req.body);

        if (req.params.matchid) {
            if (this.body.uuid && this.body.uuid !== req.params.matchid) {
                throw new Error("uuid in request and body differ. aaargs.");
            }
            this.body.uuid = req.params.matchid;
        }
    }

    public getMatch(): Match {
        return new Match(this.body);
    }
}
