"use strict";

import * as matchdb from "../lib/db/match";
import * as sharedb from "../lib/db/share";
import * as logger from "./logger";
import {INodebbRequest, INodebbResponse} from "../types/nodebb";
import {Match} from "./match";

const toXml = require("xml2json").toXml as (json: any) => string;

export default function (params, meta, callback) {

    const renderMatchEdit = function (req: INodebbRequest, res: INodebbResponse) {
        const tid: number = Number(req.params.tid);
        const matchid: string = req.params.matchid;

        matchdb.getFromDb(tid, matchid).then((match: Match) => {
            if (!match) {
                return res.render("actions/match-not-found", {tid, matchid});
            }

            const xmlString = toXml({match});
            res.render("actions/match-edit", {
                matchid,
                spec: xmlString,
                tid,
            });
        }).catch(err => {
            logger.error(err)
            return res.render("actions/500", {tid, matchid});
        });
    };

    const renderMatchAdd = function (req: INodebbRequest, res: INodebbResponse) {
        const tid = Number(req.params.tid);

        res.render("actions/match-add", {
            tid,
        });
    };

    const renderMatchShare = function (req: INodebbRequest, res: INodebbResponse) {
        const tid: number = Number(req.params.tid);
        const matchid = req.params.matchid;

        matchdb.getUniqueMatchReservations(tid, matchid).then(result => {
            sharedb.getAllFromDb(tid, matchid).then(shares => {
                shares.forEach(share => {
                    const index = result.indexOf(share.reservation);
                    if (index > -1) {
                        result.splice(index, 1);
                    }
                });

                res.render("actions/match-share", {
                    tid,
                    matchid,
                    availableReservations: result,
                    activeReservations: shares
                });
            }).catch(err => {
                logger.error(err.message, err);
                return res.render("actions/500", {tid, matchid});
            });
        });
    };

    params.router.get("/" + meta.nbbId + "/:tid/match/:matchid/edit", params.middleware.buildHeader, renderMatchEdit);
    params.router.get("/api/" + meta.nbbId + "/:tid/match/:matchid/edit", renderMatchEdit);

    params.router.get("/" + meta.nbbId + "/:tid/match/add", params.middleware.buildHeader, renderMatchAdd);
    params.router.get("/api/" + meta.nbbId + "/:tid/match/add", renderMatchAdd);

    params.router.get("/" + meta.nbbId + "/:tid/match/:matchid/share", params.middleware.buildHeader, renderMatchShare);
    params.router.get("/api/" + meta.nbbId + "/:tid/match/:matchid/share", renderMatchShare);

    callback();
}
