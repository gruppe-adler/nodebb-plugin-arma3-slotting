"use strict";

import {INodebbRequest, INodebbResponse} from "../../types/nodebb";
import * as matchDb from "../db/match";
import * as slotDb from "../db/slot";

export function getAll(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid: string = req.params.matchid;

    slotDb.getMatchUsers(tid, matchid).then(users => {
        matchDb.getMatchReservations(tid, matchid).then(reservations => {
            reservations = reservations || {};
            return res.status(200).json({users, reservations});
        }).catch(err => {
            return res.status(500).json(err);
        });
    }).catch(error => {
        return res.status(500).json(error);
    });
}
