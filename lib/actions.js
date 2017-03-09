"use strict";

var matchdb = require('../lib/db/match');
var xml2json = require('xml2json');

module.exports = function (params, meta, callback) {

    var renderMatchEdit = function(req, res, next) {
        let tid = req.params.tid;
        let matchid = req.params.matchid;
        matchdb.getFromDb(tid, matchid, function (match) {

            let xmlString = xml2json.toXml({match: match});
            res.render('actions/match-edit', {
                tid: tid,
                matchid: matchid,
                spec: xmlString
            });
        });
    };
    params.router.get('/' + meta.nbbId + '/:tid/match/:matchid/edit', params.middleware.buildHeader, renderMatchEdit);

    callback();
};
