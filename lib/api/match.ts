"use strict";

const xml2json = require('xml2json');
import {Element, XMLDocument} from '../../types/libxmljs-fixes'
import {parseXml} from 'libxmljs';
const uuid = require('node-uuid');
const _ = require('underscore');

const slotDb = require('../db/slot');
const async = require('async');
const logger = require('../logger');
const userDb = require('../db/users');
import * as matchDb from '../db/match';
import {NodebbRequest, NodebbResponse} from '../../types/nodebb';

function ensureUuidsForSlots(xmlDoc) {
    xmlDoc.find('//slot').forEach(function(slot) {
        if (!slot.attr('uuid')) {
            slot.attr({uuid: uuid.v4()});
        }
    });
}

function sendMatchesResult(req: NodebbRequest, res: NodebbResponse, result) {
    let accepts = req.header('Accept');
    if (accepts === 'application/xml') {
        let xmlString = xml2json.toXml(result);
        res.append('Content-Type', 'application/xml');
        return res.send(xmlString);
    }

    res.json(result ? (result.matches || result) : result);
}

function sendMatchResult(req, res, result) {
    let accepts = req.header('Accept');
    if (accepts === 'application/xml') {
        let xmlString = xml2json.toXml({match: result});
        res.append('Content-Type', 'application/xml');
        return res.send(xmlString);
    }

    res.json(result ? (result.match || result) : result);
}

function addUsersAndReservations(currentUser, tid, match, callback) {
    async.parallel(
        [
            _.partial(slotDb.getMatchUsers, tid, match.uuid),
            _.partial(slotDb.getMatchReservations, tid, match.uuid)
        ],
        function (err, results) {
            if (err) {
                return callback(err);
            }

            let slotidUidMap = results[0] || {};
            const uidUserNodeMap = {};
            let reservations = results[1] || {};
            var newMatch = match;
            let xmlDoc: XMLDocument;

            try {
                // winston.info(JSON.stringify(match));
                let xmlString = xml2json.toXml({match: match});
                // winston.warn(xmlString);
                xmlDoc = parseXml(xmlString);
                xmlDoc.find('//slot').forEach(function (slot: Element) {
                    const slotid = slot.attr('uuid').value();

                    if (slotidUidMap[slotid]) {
                        let user = slot.node('user');
                        let uid = slotidUidMap[slotid];
                        if (uid > 0) {
                            user.attr('uid', uid);
                            uidUserNodeMap[uid] = user;
                        } else {
                            logger.warn('slot ' + slotid + ' contains uid<=0 ');
                        }
                    }
                    if (reservations[slotid]) {
                        let reservation = slot.node('reservation');
                        reservation.text(reservations[slotid]);
                    }
                });
            } catch (e) {
                return callback(e);
            }

            userDb.getUsers(currentUser, Object.getOwnPropertyNames(uidUserNodeMap), function (err, users) {
//                winston.info(JSON.stringify(users));
                users.forEach(function (user) {
                    const node = uidUserNodeMap[user.uid];
                    if (!node) {
                        return logger.error('something went wrong. WRONG, I SAY! ' + user.uid + ' not found in node map');
                    }
                    Object.getOwnPropertyNames(user).forEach(function (propName) {
                        node.attr(propName, user[propName]);
                    });
                });
                try {
                    newMatch = xml2json.toJson(xmlDoc.toString(false), {object: true}).match;
                    callback(null, newMatch);
                } catch (e) {
                    callback(e, null);
                }
            });

        }
    );
}

function putMatch(tid: number, matchId: string, res: NodebbResponse, reqBody: string, callback) {

    function saveUsers(xmlDoc, next) {
        const funcs = xmlDoc.find('//user').map(function (user) {
            return function (next) {
                const slot = user.parent();

                user.remove(); // when saving the occupant somewhere else, we can do away with the user definition in xml

                if (!slot || slot.name() !== 'slot') {
                    next(new Error('found user node with non-slot parent ' + slot)); return;
                }
                const uid = user.attr('uid') ? user.attr('uid').value() : null;
                if (!uid) {
                    next(new Error('user without uid found!')); return;
                }

                const slotid = slot.attr('uuid').value();
                logger.info('saving user %s to slot %s'.replace('%s', uid).replace('%s', slotid));
                slotDb.deleteMatchUser(tid, matchId, uid, function (err) {
                    if (err) {
                        next(err); return
                    }
                    slotDb.putSlotUser(tid, matchId, slotid, uid, next);
                });

            }
        });
        async.parallel(funcs, next);
    }
    function saveReservations(xmlDoc, next) {
        const funcs = xmlDoc.find('//reservation').map(function (reservation) {
            return function (next) {
                const slot = reservation.parent();
                if (!slot || slot.name() !== 'slot') {
                    next(new Error('found user node with non-slot parent ' + slot)); return;
                }

                reservation.remove();

                const slotid = slot.attr('uuid').value();
                logger.info('saving reservation %s to slot %s'.replace('%s', reservation.text()).replace('%s', slotid));
                slotDb.putSlotReservation(tid, matchId, slotid, reservation.text(), next);
            };
        });
        async.parallel(funcs, next);
    }

    let xmlDoc;
    let xml: string = reqBody;
    try {
        if (typeof reqBody !== 'string') { // i.e. if its already an object (auto-parsed JSON…)
            xml = xml2json.toXml(reqBody);
        }
        xmlDoc = parseXml(xml);
    } catch (e) {
        return res.status(400).json({offendingBody: reqBody, offendingXmlString: xml, error: {message: e.message, type: e.source}});
    }

    if (xmlDoc.find('//slot').length === 0) {
        // seems to be short form. expand!
        return res.status(501).json({"message": "expansion not yet supported"});
    }

    ensureUuidsForSlots(xmlDoc);

    async.parallel([
        _.partial(saveReservations, xmlDoc),
        _.partial(saveUsers, xmlDoc)
    ], function (err, result) {
        logger.info('saved match ' + matchId + ' to topic ' + tid);
        if (err) {
            logger.error("error saving match :(");
            return callback(err);
        }

        let finalJson = xml2json.toJson(xmlDoc.toString(false), {object: true});
        if (!finalJson.match) {
            return res.status(400).json({message: 'no <match> element? oO'});
        }
        finalJson.match.uuid = matchId;

        matchDb.saveToDb(tid, matchId, finalJson, function (err) {
            callback(err, finalJson);
        });
    });
}

export function post(req: NodebbRequest, res: NodebbResponse, next) {
    let tid: number = Number(req.params.tid);
    let matchId: string = uuid.v4();

    putMatch(tid, matchId, res, req.body, function (err: Error, finalJson) {
        if (err) {
            return res.status(500).json(err);
        }

        res.setHeader('Location', '/api/arma3-slotting/match/' + matchId);
        res.status(201);
        return sendMatchResult(req, res, finalJson);
    });
}

export function put(req: NodebbRequest, res: NodebbResponse, next) {
    let tid: number = Number(req.params.tid);
    let matchId: string = req.params.matchid;

    putMatch(tid, matchId, res, req.body, function (err) {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(204).json(null);
    });
}

export function getAll(req: NodebbRequest, res: NodebbResponse, next) {
    let tid = req.params.tid;

    matchDb.getAllFromDb(tid, function (err, matches/*: Array<Match>*/) {
        if (err) {
            return res.status(500).json(err);
        }

        if (!req.query.withusers) {
            res.status(200);
            return sendMatchesResult(req, res, matches);
        }

        async.parallel(matches.map(function (match) {
            return _.partial(addUsersAndReservations, req.uid, tid, match)
        }), function (err, newMatches) {
            if (err) {
                return res.status(500).json({exception: err, message: err.message, stacktrace: err.stack});
            }
            res.status(200);
            sendMatchesResult(req, res, {matches: newMatches});
        });
    });
}

export function get(req: NodebbRequest, res: NodebbResponse, next) {
    let tid = req.params.tid;
    let matchid = req.params.matchid;

    matchDb.getFromDb(tid, matchid, function (err: Error, match: matchDb.MatchWrapper) {
        if (err) {
            return res.status(500).json(err);
        }

        if (!match) {
            return res.status(404).json(err);
        }

        if (!req.query.withusers) {
            res.status(200);
            return sendMatchResult(req, res, match.match);
        }

        return addUsersAndReservations(req.uid, tid, match.match, function (err, newMatch) {
            if (err) {
                return res.status(500).json({exception: err, message: err.message, stacktrace: err.stack});
            }
            res.status(200);
            sendMatchResult(req, res, newMatch);
        });
    });
}

export function del (req: NodebbRequest, res: NodebbResponse, next) {
    let tid = req.params.tid;
    let matchid = req.params.matchid;

    matchDb.delFromDb(tid, matchid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(204).json();
    });
}
