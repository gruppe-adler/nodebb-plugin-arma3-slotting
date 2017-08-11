"use strict";

import * as matchdb from '../lib/db/match';
import * as xml2json from 'xml2json';
import {NodebbRequest, NodebbResponse} from '../types/nodebb';

export default function (params, meta, callback) {

    const renderMatchEdit = function (req, res, next) {
        let tid = req.params.tid;
        let matchid = req.params.matchid;

        matchdb.getFromDb(tid, matchid, function (err: Error, match: matchdb.MatchWrapper) {
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

    const renderMatchAdd = function (req: NodebbRequest, res: NodebbResponse, next) {
        let tid = req.params.tid;

        res.render('actions/match-add', {
            tid: tid
        });
    };

    params.router.get('/' + meta.nbbId + '/:tid/match/:matchid/edit', params.middleware.buildHeader, renderMatchEdit);
    params.router.get('/api/' + meta.nbbId + '/:tid/match/:matchid/edit', renderMatchEdit);


    params.router.get('/' + meta.nbbId + '/:tid/match/add', params.middleware.buildHeader, renderMatchAdd);
    params.router.get('/api/' + meta.nbbId + '/:tid/match/add', renderMatchAdd);

    callback();
};
