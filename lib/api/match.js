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

function saveToDb(tid, matchid, matchJson, callback) {
    db.setObjectField(getRedisMatchesKey(tid), matchid, JSON.stringify(matchJson), callback);
}

function delFromDb(tid, matchid, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid), matchid, callback);
}

function getAllFromDb(tid, callback) {
    db.getObject(getRedisMatchesKey(tid), function (err, result) {
        result = result || {};
        Object.keys(result).forEach(function (key) {
            if (result[key]) {
                result[key] = JSON.parse(result[key]).match
            } else {
                delete result[key];
            }
        });
        callback(err, result);
    })
}


function getFromDb(tid, matchid, callback) {
    db.getObjectField(getRedisMatchesKey(tid), matchid, function (err, result) {
        callback(err, JSON.parse(result || "null"));
    });
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
        return res.status(202).json(finalJson);
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

    getAllFromDb(tid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(result);
    });
};


module.exports.get = function (req, res, next) {
    let tid = req.params.tid;
    let matchid = req.params.matchid;

    getFromDb(tid, matchid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }

        if (!result) {
            return res.status(404);
        }
        return res.status(200).json(result);
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
