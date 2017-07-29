"use strict";

var meta = require('./plugin.json');
meta.nbbId = meta.id.replace(/nodebb-plugin-/, '');

var unattendUser = require('./lib/unattendUser');
var notifications = require('./lib/db/notifications');

module.exports.setup = function (params, callback) {
    let admin = require('./lib/admin');
    let api = require('./lib/api');
    let actions = require('./lib/actions');

    admin(params, meta, function () {

        api.setAllowedCategories(admin.getAllowedCategories());
        api.setApiKey(admin.getApiKey());
        api(params, callback);
    });

    actions(params, meta, function () {
    });
};

module.exports.catchAttendanceChange = function (params, callback) {
    if (params.probability >= 1) {
        return callback && callback();
    }
    unattendUser.unattendUser(params.tid, params.uid, function (err, resultCount) {
        if (resultCount) {
            notifications.notifyAutoUnslotted(params.tid, params.uid, resultCount);
        }
        callback && callback();
    });
};

module.exports.admin = {
    menu: function (custom_header, callback) {
        custom_header.plugins.push({
            "route": '/plugins/' + meta.nbbId,
            "icon": 'fa-calendar',
            "name": meta.name
        });

        callback(null, custom_header);
    }
};
