"use strict";

const xml2json = require('xml2json');
const libxmljs = require('libxmljs');
const uuid = require('node-uuid');

const db = require('../../../../src/database');

function getRedisMatchesKey(tid) {
    return 'tid:%d:arma3-slotting:matches'.replace('%d', tid);
}


function ensureUuidsForSlots(xmlDoc) {
    xmlDoc.find('//slot').forEach(function(slot) {
        if (!slot.attr('uuid')) {
            slot.attr({uuid: uuid.v4()})
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
        Object.keys(result).forEach(function (key) {
            if (result[key]) {
                result[key] = JSON.parse(result[key])
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

    let xml = '';
    try {
        xml = xml2json.toXml(reqBody);
    } catch (e) {
        return res.status(400).json(e);
    }
    const xmlDoc = libxmljs.parseXml(xml);
    xmlDoc.setDtd('match', '../match.dtd'); // that doesnt seem to do anything atm
    if (xmlDoc.find('//slot').length === 0) {
        // seems to be short form. expand!
        return res.status(501).json({"message": "expansion not yet supported"});
    }

    ensureUuidsForSlots(xmlDoc);

    let finalJson = xml2json.toJson(xmlDoc.toString(false), {object: true});
    saveToDb(tid, matchId, finalJson, function (err) {
        callback(err, finalJson);
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
