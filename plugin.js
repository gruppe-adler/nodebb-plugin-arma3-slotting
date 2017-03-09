"use strict";

var meta = require('./plugin.json');
meta.nbbId = meta.id.replace(/nodebb-plugin-/, '');

module.exports.setup = function (params, callback) {
    let admin = require('./lib/admin');
    let api = require('./lib/api');
    let actions = require('./lib/actions');

    admin(params, meta, function () {

        api.setAllowedCategories(admin.getAllowedCategories());
        api.setApiKey(admin.getApiKey());
        api(params, callback);
    });

    actions(params, meta, function () {});
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

module.exports.changeClientRouting = function (config, callback) {
    config.custom_mapping['^arma3-slotting/match/.*/edit'] = 'actions/match-edit';
    callback(null, config);
};
