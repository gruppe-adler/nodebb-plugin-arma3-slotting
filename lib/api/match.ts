"use strict";
import json2xml from '../json2xml';
import {values} from "underscore";

import {INodebbRequest, INodebbResponse} from "../../types/nodebb";
import * as matchDb from "../db/match";
import * as slotDb from "../db/slot";
import * as userDb from "../db/users";
import * as logger from "../logger";
import { IMatchOutputUser, Match, Slot } from '../match';
import {XmlMatchRequest} from "../xml-match-request";
import {socketio} from '../nodebb';
import {Slot2User} from '../db/slot';

const websocket = socketio.server.of('/slotting');

function sendMatchesResult(req: INodebbRequest, res: INodebbResponse, result: Match[]) {
    const accepts = req.header("Accept");
    if (accepts === "application/xml") {
        const xmlString = json2xml({matches: result});
        res.append("Content-Type", "application/xml");
        return res.send(xmlString);
    }

    res.json(result);
}

function sendMatchResult(req: INodebbRequest, res: INodebbResponse, result: Match) {
    const accepts = req.header("Accept");
    if (accepts === "application/xml") {
        const xmlString = json2xml({match: result});
        res.append("Content-Type", "application/xml");
        return res.send(xmlString);
    }

    res.json(result);
}

export async function addUsersAndReservations(currentUser, tid: number, match: Match): Promise<Match> {
    const slot2user: Slot2User = await slotDb.getMatchUsers(tid, match.uuid)

    const users = await userDb.getUsers(
        currentUser,
        values(slot2user)
    )

    Object.keys(slot2user).forEach((slotid: string) => {
        const uid = slot2user[slotid];
        const slot = match.getSlot(slotid);
        if (slot) {
            // Check if uid is typeof string indicating that the user is external
            if (typeof uid === typeof "") {
                let suid = String(uid);
                let iconText = "E";
                let username = suid;
                // Parse out clan shortcode
                if (suid.indexOf(':') > -1) {
                    const splitted = suid.split(':', 2);
                    iconText = splitted[0];
                    username = splitted[1];
                }

                slot.user = <IMatchOutputUser>{
                    uid: -1,
                    username: username,
                    userslug: username,
                    picture: "",
                    "icon:bgColor": "#673ab7",
                    "icon:text": iconText,
                    groupTitle: "",
                    groups: []
                };
            } else {
                slot.user = users.find(_ => _.uid === uid);
            }
        } else {
            logger.debug(`slot ${slotid} seems to not exist in match ${tid}/${match.uuid} anymore, ` +
                `although user ${uid} is slotted`);
        }
    });

    return match;
}

async function putMatch(tid: number, match: Match): Promise<Match|undefined> {

    async function saveUsers(): Promise<any> {
        const funcs = match.getSlots().map(function (slot: Slot) {
            const user = slot.user;
            if (!user) {
                return function (cb) {
                    cb();
                };
            }
            return async function (): Promise<any> {

                // when saving the occupant somewhere else,we can do away with the user definition here
                slot.user = undefined;

                const uid: number = user.uid;
                if (!uid) {
                    throw new Error("user without uid found!")
                }

                const slotid = slot.uuid;
                logger.info(`saving user ${uid} to slot ${slotid}`);

                await slotDb.deleteMatchUser(tid, match.uuid, uid)
                await slotDb.putSlotUser(tid, match.uuid, slotid, uid);
            };
        });
        return Promise.all(funcs);
    }

    try {
        await saveUsers();
        logger.info("saved match " + match.uuid + " to topic " + tid);
    } catch (err) {
        logger.error("error saving match :(");
        return;
    }

    await matchDb.saveToDb(tid, match.uuid, match);

    websocket.emit('event:match-changed', {
        tid: tid,
        matchid: match.uuid
    });

    return match;
}

export function post(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    try {
        (new XmlMatchRequest(req as any)).getMatch().then(match => {
            putMatch(tid, match).then((newMatch: Match) => {
                res.setHeader("Location", "/api/arma3-slotting/match/" + newMatch.uuid);
                res.status(201);
                return sendMatchResult(req, res, newMatch);
            }).catch(err => {
                return res.status(500).json(err);
            });

        }).catch(err => {
            return res.status(500).json(err);
        });
    } catch (e) {
        return res
            .status(400)
            .json({offendingBody: req.body, error: {message: e.message, type: e.source}});
    }
}

export function put(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);

    try {
        (new XmlMatchRequest(req as any)).getMatch().then(match => {
            putMatch(tid, match).then(() => {
                return res.status(204).json(null);
            }).catch((err: Error) => {
                return res.status(500).json(err);
            });

        });
    } catch (e) {
        return res
            .status(400)
            .json({offendingBody: req.body, error: {message: e.message, type: e.source}});
    }

}

export function getAll(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);

    matchDb.getAllFromDb(tid).then((matches: Match[]) => {
        if (!req.query.withusers) {
            res.status(200);
            return sendMatchesResult(req, res, matches);
        }

        Promise.all(matches.map(function (match: Match) {
            return addUsersAndReservations(req.uid, tid, match);
        })).then(newMatches => {
            newMatches.forEach(newMatch => newMatch.updateSlottedPlayerCount());
            res.status(200);
            sendMatchesResult(req, res, newMatches);
        }).catch(error => {
            return res.status(500).json({exception: error, message: error.message, stacktrace: error.stack});
        })
    }).catch(err => {
        return res.status(500).json(err);
    })
}

export function get(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid)
    const matchid = req.params.matchid

    matchDb.getFromDb(tid, matchid).then((match: Match) => {
        if (!match) {
            return res.status(404).json({message: `match ${matchid} not found`})
        }

        if (!req.query.withusers) {
            res.status(200)
            return sendMatchResult(req, res, match)
        }

        return addUsersAndReservations(req.uid, tid, match).then((newMatch: Match) => {
            newMatch.updateSlottedPlayerCount()
            res.status(200)
            sendMatchResult(req, res, newMatch)
        }).catch(error => {
            return res.status(500).json({exception: error, message: error.message, stacktrace: error.stack});
        })
    }).catch(err => {
        return res.status(500).json(err)
    })
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;

    matchDb.delFromDb(tid, matchid).then(() => {
        return res.status(204).json();
    }).catch((err) => {
        return res.status(500).json(err);
    })
}
