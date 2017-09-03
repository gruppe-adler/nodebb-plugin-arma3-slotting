"use strict";

import {INodebbRequest, INodebbResponse} from "../../types/nodebb";
import * as matchDb from "../db/match";
import * as slotDb from "../db/slot";

export function getAll(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid: string = req.params.matchid;

    slotDb.getMatchUsers(tid, matchid, function (error: Error, users) {
        if (error) {
            return res.status(500).json(error);
        }
        users = users || {};
        Object.keys(users).forEach(function (key) {
            users[key] = parseInt(users[key], 10);
        });
        matchDb.getMatchReservations(tid, matchid, function (err, reservations) {
            if (err) {
                return res.status(500).json(err);
            }
            reservations = reservations || {};

            return res.status(200).json({users, reservations});

        });
    });
}
