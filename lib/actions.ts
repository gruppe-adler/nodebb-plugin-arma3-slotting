"use strict";

import * as matchdb from "../lib/db/match";
import {INodebbRequest, INodebbResponse} from "../types/nodebb";
import {Match} from "./match";

const toXml = require("xml2json").toXml as (json: any) => string;

export default function (params, meta, callback) {

    const renderMatchEdit = function (req: INodebbRequest, res: INodebbResponse) {
        const tid: number = Number(req.params.tid);
        const matchid: string = req.params.matchid;

        matchdb.getFromDb(tid, matchid, function (err: Error, match: Match) {
            if (err) {
                return res.render("actions/500", {tid, matchid});
            }

            if (!match) {
                return res.render("actions/match-not-found", {tid, matchid});
            }

            const xmlString = toXml({match});
            res.render("actions/match-edit", {
                matchid,
                spec: xmlString,
                tid,
            });
        });
    };

    const renderMatchAdd = function (req: INodebbRequest, res: INodebbResponse) {
        const tid = req.params.tid;

        res.render("actions/match-add", {
            tid,
        });
    };

    params.router.get("/" + meta.nbbId + "/:tid/match/:matchid/edit", params.middleware.buildHeader, renderMatchEdit);
    params.router.get("/api/" + meta.nbbId + "/:tid/match/:matchid/edit", renderMatchEdit);

    params.router.get("/" + meta.nbbId + "/:tid/match/add", params.middleware.buildHeader, renderMatchAdd);
    params.router.get("/api/" + meta.nbbId + "/:tid/match/add", renderMatchAdd);

    callback();
}
