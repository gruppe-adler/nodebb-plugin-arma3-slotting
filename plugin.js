"use strict";

var meta = require('./plugin.json');
meta.nbbId = meta.id.replace(/nodebb-plugin-/, '');

module.exports.setup = function (params, callback) {
    var api = require('./lib/api');
    require('./lib/admin')(params, meta, api.setApiKey);
    api(params, callback);
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
