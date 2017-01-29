"use strict";

const xml2json = require('xml2json');
const libxmljs = require('libxmljs');
const uuid = require('node-uuid');
const _ = require('underscore');

const db = require('../../../../src/database');
const slotDb = require('../db/slot');
const async = require('async');
const winston = require('winston');

function getRedisMatchesKey(tid) {
    return 'tid:%d:arma3-slotting:matches'.replace('%d', tid);
}

function ensureUuidsForSlots(xmlDoc) {
    xmlDoc.find('//slot').forEach(function(slot) {
        if (!slot.attr('uuid')) {
            slot.attr({uuid: uuid.v4()});
        }
    });
}


function sendMatchesResult(req, res, result) {
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
        let xmlString = xml2json.toXml(result);
        res.append('Content-Type', 'application/xml');
        return res.send(xmlString);
    }

    res.json(result ? (result.match || result) : result);
}

function saveToDb(tid, matchid, matchJson, callback) {
    db.setObjectField(getRedisMatchesKey(tid), matchid, JSON.stringify(matchJson), callback);
}

function delFromDb(tid, matchid, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid), matchid, callback);
}



function getAllFromDb(tid, callback) {
    db.getObject(getRedisMatchesKey(tid), function (err, result) {
        if (err) {
            return callback(err, null);
        }

        let matches = [];
        Object.keys(result || {}).forEach(function (key) {
            if (result[key]) {
                let match = JSON.parse(result[key]);
                matches.push(match.match || match);
            }
        });
        callback(err, matches);
    })
}

function getFromDb(tid, matchid, callback) {
    db.getObjectField(getRedisMatchesKey(tid), matchid, function (err, result) {
        callback(err, JSON.parse(result || "null"));
    });
}


function addUsersAndReservations(tid, match, callback) {
    async.parallel(
        [
            _.partial(slotDb.getMatchUsers, tid, match.uuid),
            _.partial(slotDb.getMatchReservations, tid, match.uuid)
        ],
        function (err, results) {
            if (err) {
                return callback(err);
            }

            let users = results[0] || {};
            let reservations = results[1] || {};
            var newMatch = match;

            try {
                winston.info(JSON.stringify(match));
                let xmlString = xml2json.toXml({match: match});
                winston.warn(xmlString);
                let xmlDoc = libxmljs.parseXml(xmlString);
                xmlDoc.find('//slot').forEach(function (slot) {
                    const slotid = slot.attr('uuid').value();
                    if (users[slotid]) {
                        let user = slot.node('user');
                        user.attr('uid', users[slotid]);
                    }
                    if (reservations[slotid]) {
                        let reservation = slot.node('reservation');
                        reservation.text(reservations[slotid]);
                    }
                });
                newMatch = xml2json.toJson(xmlDoc.toString(false), {object: true}).match;
            } catch (e) {
                return callback(e);
            }

            callback(null, newMatch);
        }
    );
}


function putMatch(tid, matchId, res, reqBody, callback) {

    function saveUsers(xmlDoc, next) {
        const funcs = xmlDoc.find('//user').map(function (user) {
            return function (next) {
                const slot = user.parent();
                if (!slot || slot.name() !== 'slot') {
                    return next(new Error('found user node with non-slot parent ' + slot));
                }
                const uid = user.attr('uid') ? user.attr('uid').value() : null;
                if (!uid) {
                    return next(new Error('user without uid found!'));
                }

                const slotid = slot.attr('uuid').value();
                winston.info('saving user %s to slot %s'.replace('%s', uid).replace('%s', slotid));
                slotDb.putMatchUser(tid, matchId, slotid, uid, next);
            }
        });
        async.parallel(funcs, next);
    }
    function saveReservations(xmlDoc, next) {
        const funcs = xmlDoc.find('//reservation').map(function (reservation) {
            return function (next) {
                const slot = reservation.parent();
                if (!slot || slot.name() !== 'slot') {
                    return next(new Error('found user node with non-slot parent ' + slot));
                }

                const slotid = slot.attr('uuid').value();
                winston.info('saving reservation %s to slot %s'.replace('%s', reservation.text()).replace('%s', slotid));
                slotDb.putMatchUser(tid, matchId, slotid, reservation.text(), next);
            };
        });
        async.parallel(funcs, next);
    }

    let xmlDoc;
    let xmlString = reqBody;
    try {
        if (typeof reqBody !== 'string') {
            xmlString = xml2json.toXml(reqBody);
        }
        xmlDoc = libxmljs.parseXml(xmlString);
    } catch (e) {
        return res.status(400).json({offendingBody: reqBody, offendingXmlString: xmlString, error: {message: e.message, type: e.source}});
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
        winston.info('saved match ' + matchId + ' to topic ' + tid);
        if (err) {
            winston.error("error saving match :(");
            return callback(err);
        }

        let finalJson = xml2json.toJson(xmlDoc.toString(false), {object: true});
        if (!finalJson.match) {
            return res.status(400).json({message: "no <match> element? oO"});
        }
        finalJson.match.uuid = matchId;

        saveToDb(tid, matchId, finalJson, function (err) {
            callback(err, finalJson);
        });
    });
}

module.exports.post = function (req, res, next) {
    let tid = req.params.tid;
    let matchId = uuid.v4();

    putMatch(tid, matchId, res, req.body, function (err, finalJson) {
        if (err) {
            return res.status(500).json(err);
        }

        res.setHeader('Location', '/api/arma3-slotting/match/' + matchId);
        res.status(202);
        return sendMatchResult(req, res, finalJson);
    });
};

module.exports.put = function (req, res, next) {
    let tid = req.params.tid;
    let matchId = req.params.matchid;

    putMatch(tid, matchId, res, req.body, function (err) {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(204).json(null);
    });
};

module.exports.getAll = function (req, res, next) {
    let tid = req.params.tid;

    getAllFromDb(tid, function (err, matches/*: Array<Match>*/) {
        if (err) {
            return res.status(500).json(err);
        }

        if (!req.query.withusers) {
            res.status(200);
            return sendMatchesResult(req, res, matches);
        }

        async.parallel(matches.map(function (match) {
            return _.partial(addUsersAndReservations, tid, match)
        }), function (err, newMatches) {
            if (err) {
                return res.status(500).json({exception: err, message: err.message, stacktrace: err.stack});
            }
            res.status(200);
            sendMatchesResult(req, res, {matches: newMatches});
        });
    });
};

module.exports.get = function (req, res, next) {
    let tid = req.params.tid;
    let matchid = req.params.matchid;

    getFromDb(tid, matchid, function (err, match/*: Match*/) {
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

        return addUsersAndReservations(tid, match.match, function (err, newMatch) {
            if (err) {
                return res.status(500).json({exception: err, message: err.message, stacktrace: err.stack});
            }
            res.status(200);
            sendMatchResult(req, res, newMatch);
        });
    });
};

module.exports.delete = function (req, res, next) {
    let tid = req.params.tid;
    let matchid = req.params.matchid;

    delFromDb(tid, matchid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(204).json();
    });
};
