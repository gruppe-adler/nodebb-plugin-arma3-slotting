"use strict";

const xml2json = require("xml2json") as { toJson: (xml: any, conf: any) => any, toXml: (obj: any) => string };

import {AnyCallback} from "../fn";

import * as _ from "underscore";

import * as async from "async";
import {INodebbRequest, INodebbResponse} from "../../types/nodebb";
import * as matchDb from "../db/match";
import * as slotDb from "../db/slot";
import * as userDb from "../db/users";
import * as logger from "../logger";
import {IMatchUser, Match, Slot} from "../match";
import {XmlMatchRequest} from "../xml-match-request";

function sendMatchesResult(req: INodebbRequest, res: INodebbResponse, result: Match[]) {
    const accepts = req.header("Accept");
    if (accepts === "application/xml") {
        const xmlString = xml2json.toXml({matches: result});
        res.append("Content-Type", "application/xml");
        return res.send(xmlString);
    }

    res.json(result);
}

function sendMatchResult(req: INodebbRequest, res: INodebbResponse, result: Match) {
    const accepts = req.header("Accept");
    if (accepts === "application/xml") {
        const xmlString = xml2json.toXml({match: result});
        res.append("Content-Type", "application/xml");
        return res.send(xmlString);
    }

    res.json(result);
}

function addUsersAndReservations(currentUser, tid: number, match: Match, callback: (Error, newMatch: Match) => any) {
    slotDb.getMatchUsers(tid, match.uuid, function (err: Error, slotidUidMap: { [uuid: string]: string }) {
            slotidUidMap = slotidUidMap || {};
            if (err) {
                return callback(err, null);
            }

            const uidUserNodeMap: { [uid: number]: IMatchUser } = {};

            try {
                match.getSlots().forEach(function (slot: Slot) {
                    const slotid = slot.uuid;

                    if (slotidUidMap[slotid]) {
                        const uid = Number(slotidUidMap[slotid]);
                        if (uid > 0) {
                            slot.user = {uid};
                            uidUserNodeMap[uid] = slot.user;
                        } else {
                            logger.warn("slot " + slotid + " contains uid<=0 ");
                        }
                    }
                });
            } catch (e) {
                return callback(e, null);
            }

            userDb.getUsers(
                currentUser,
                Object.getOwnPropertyNames(uidUserNodeMap).map(Number),
                function (error, users) {
                    users.forEach(function (user) {
                        const matchUser = uidUserNodeMap[user.uid];
                        if (!matchUser) {
                            return logger.error("something went wrong. " + user.uid + " not found in node map");
                        }
                        Object.getOwnPropertyNames(user).forEach(function (propName) { // copy over properties
                            matchUser[propName] = user[propName];
                        });
                    });
                    try {
                        callback(null, match);
                    } catch (e) {
                        callback(e, null);
                    }
                },
            );

        },
    );
}

function putMatch(tid: number,
                  match: Match,
                  callback: (error: Error, match?: Match) => any) {

    function saveUsers(next: AnyCallback) {
        const funcs = match.getSlots().map(function (slot: Slot) {
            const user = slot.user;
            if (!user) {
                return function (cb) {
                    cb();
                };
            }
            return function (cb: AnyCallback) {

                // when saving the occupant somewhere else,we can do away with the user definition here
                slot.user = undefined;

                const uid: number = user.uid;
                if (!uid) {
                    cb(new Error("user without uid found!"));
                    return;
                }

                const slotid = slot.uuid;
                logger.info(`saving user ${uid} to slot ${slotid}`);

                slotDb.deleteMatchUser(tid, match.uuid, uid, function (err) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    slotDb.putSlotUser(tid, match.uuid, slotid, uid, cb);
                });

            };
        });
        async.parallel(funcs, next);
    }

    saveUsers(function (err: Error) {
        logger.info("saved match " + match.uuid + " to topic " + tid);
        if (err) {
            logger.error("error saving match :(");
            return callback(err);
        }

        matchDb.saveToDb(tid, match.uuid, match, function (error: Error) {
            callback(error, match);
        });
    });
}

export function post(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    let match: Match = null;
    try {
        match = (new XmlMatchRequest(req)).getMatch();
    } catch (e) {
        return res
            .status(400)
            .json({offendingBody: req.body, error: {message: e.message, type: e.source}});
    }

    putMatch(tid, match, function (err: Error, newMatch: Match) {
        if (err) {
            return res.status(500).json(err);
        }

        res.setHeader("Location", "/api/arma3-slotting/match/" + newMatch.uuid);
        res.status(201);
        return sendMatchResult(req, res, newMatch);
    });
}

export function put(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);

    let match: Match = null;
    try {
        match = (new XmlMatchRequest(req)).getMatch();
    } catch (e) {
        return res
            .status(400)
            .json({offendingBody: req.body, error: {message: e.message, type: e.source}});
    }

    putMatch(tid, match, function (err: Error) {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(204).json(null);
    });
}

export function getAll(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);

    matchDb.getAllFromDb(tid, function (err, matches: Match[]) {
        if (err) {
            return res.status(500).json(err);
        }

        if (!req.query.withusers) {
            res.status(200);
            return sendMatchesResult(req, res, matches);
        }

        async.parallel(matches.map(function (match: Match) {
            return _.partial(addUsersAndReservations, req.uid, tid, match);
        }), function (error: Error, newMatches) {
            if (error) {
                return res.status(500).json({exception: error, message: error.message, stacktrace: error.stack});
            }
            newMatches.forEach(newMatch => newMatch.updateSlottedPlayerCount())
            res.status(200);
            sendMatchesResult(req, res, newMatches);
        });
    });
}

export function get(req: INodebbRequest, res: INodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;

    matchDb.getFromDb(tid, matchid, function (err: Error, match: Match) {
        if (err) {
            return res.status(500).json(err);
        }

        if (!match) {
            return res.status(404).json(err);
        }

        if (!req.query.withusers) {
            res.status(200);
            return sendMatchResult(req, res, match);
        }

        return addUsersAndReservations(req.uid, tid, match, function (error, newMatch) {
            if (error) {
                return res.status(500).json({exception: error, message: error.message, stacktrace: error.stack});
            }
            newMatch.updateSlottedPlayerCount();
            res.status(200);
            sendMatchResult(req, res, newMatch);
        });
    });
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;

    matchDb.delFromDb(tid, matchid, function (err) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(204).json();
    });
}
