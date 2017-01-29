"use strict";

var winston = require('winston');
var Meta = require('../../../src/meta');


module.exports = function (params, meta, callback) {
    var renderAdmin = function(req, res, next) {
        res.render('admin/plugins/' + meta.nbbId, meta || {});
    };

    Meta.settings.get(meta.nbbId, function(err, settings) {
        var apiKey;
        if (err || !settings) {
            winston.warn('[plugins/' + meta.nbbId + '] Settings not set or could not be retrived!');
        } else {
            apiKey = settings['api-key'];
            winston.info('[plugins/' + meta.nbbId + '] Settings loaded');
        }

        params.router.get('/admin/plugins/' + meta.nbbId, params.middleware.admin.buildHeader, renderAdmin);
        params.router.get('/api/admin/plugins/' + meta.nbbId, renderAdmin);

        callback(apiKey);
    });
};
