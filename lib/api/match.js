"use strict";

const xml2json = require('xml2json');
const libxmljs = require('libxmljs');
const uuid = require('node-uuid');

const db = require('../../../../src/database');

function getRedisMatchKey(tid) {
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
    db.setObjectField(getRedisMatchKey(tid), matchid, JSON.stringify(matchJson), callback);
}

module.exports.post = function (req, res, next) {
    let tid = req.params.tid;
    let xml = '';
    try {
        xml = xml2json.toXml(req.body);
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
    let matchId = uuid.v4();
    saveToDb(tid, matchId, finalJson, function (err) {
        if (err) {
            return res.status(500).json(err);
        }

        res.setHeader('Location', '/api/arma3-slotting/match/' + matchId);
        return res.status(202).json(finalJson);
    });

};
