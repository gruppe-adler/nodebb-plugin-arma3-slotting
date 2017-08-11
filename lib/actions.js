"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var matchdb = require("../lib/db/match");
var xml2json = require("xml2json");
function default_1(params, meta, callback) {
    var renderMatchEdit = function (req, res, next) {
        var tid = req.params.tid;
        var matchid = req.params.matchid;
        matchdb.getFromDb(tid, matchid, function (err, match) {
            if (err) {
                return res.render('actions/500', { tid: tid, matchid: matchid });
            }
            if (!match) {
                return res.render('actions/match-not-found', { tid: tid, matchid: matchid });
            }
            delete match.tid;
            var xmlString = xml2json.toXml(match);
            res.render('actions/match-edit', {
                tid: tid,
                matchid: matchid,
                spec: xmlString
            });
        });
    };
    var renderMatchAdd = function (req, res, next) {
        var tid = req.params.tid;
        res.render('actions/match-add', {
            tid: tid
        });
    };
    params.router.get('/' + meta.nbbId + '/:tid/match/:matchid/edit', params.middleware.buildHeader, renderMatchEdit);
    params.router.get('/api/' + meta.nbbId + '/:tid/match/:matchid/edit', renderMatchEdit);
    params.router.get('/' + meta.nbbId + '/:tid/match/add', params.middleware.buildHeader, renderMatchAdd);
    params.router.get('/api/' + meta.nbbId + '/:tid/match/add', renderMatchAdd);
    callback();
}
exports.default = default_1;
;
