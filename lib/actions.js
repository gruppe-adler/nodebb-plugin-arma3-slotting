"use strict";

var matchdb = require('../lib/db/match');
var topicdb = require('../lib/db/topics');
var xml2json = require('xml2json');

module.exports = function (params, meta, callback) {

    var renderMatchEdit = function(req, res, next) {
        let tid = req.params.tid;
        let matchid = req.params.matchid;



        matchdb.getFromDb(tid, matchid, function (err, match) {
            if (err) {
                return res.render('actions/500', {tid: tid, matchid: matchid});
            }

            if (!match) {
                return res.render('actions/match-not-found', {tid: tid, matchid: matchid});
            }

            let xmlString = xml2json.toXml(match);
            res.render('actions/match-edit', {
                tid: tid,
                matchid: matchid,
                spec: xmlString
            });
        });
    };

    var renderMatchAdd = function (req, res, next) {
        let tid = req.params.tid;

        res.render('actions/match-add', {
            tid: tid
        });
    };

    var renderMatchShow = function (req, res, next) {
        let tid = req.params.tid;
        let matchid = req.params.matchid;

        topicdb.getTitle(tid, function (err, title) {
            if (err) {
                return next(err); // TODO wait… is that a good thing to do?
            }
            res.render('actions/match-show', {
                title: title,
                tid: tid,
                matchid: matchid
            });
        });
    };

    params.router.get('/' + meta.nbbId + '/:tid/match/:matchid/edit', params.middleware.buildHeader, renderMatchEdit);
    params.router.get('/api/' + meta.nbbId + '/:tid/match/:matchid/edit', renderMatchEdit);


    params.router.get('/' + meta.nbbId + '/:tid/match/add', params.middleware.buildHeader, renderMatchAdd);
    params.router.get('/api/' + meta.nbbId + '/:tid/match/add', renderMatchAdd);

    params.router.get('/' + meta.nbbId + '/:tid/match/:matchid/show', params.middleware.buildHeader, renderMatchShow);
    params.router.get('/api/' + meta.nbbId + '/:tid/match/:matchid/show', renderMatchShow);

    callback();
};
