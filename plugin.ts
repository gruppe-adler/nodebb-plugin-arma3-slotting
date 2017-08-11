import * as unattendUser from './lib/unattendUser';
import * as notifications from './lib/db/notifications';

const meta = require('./plugin.json');

meta.nbbId = meta.id.replace(/nodebb-plugin-/, '');

export function setup(params, callback) {
    let admin = require('./lib/admin');
    let api = require('./lib/api');
    let actions = require('./lib/actions').default;

    admin.init(params, meta, function () {
        api.setAllowedCategories(admin.getAllowedCategories());
        api.setApiKey(admin.getApiKey());
        api.init(params, callback);
    });

    actions(params, meta, function () {
    });
}

export function catchAttendanceChange(params, callback) {
    if (params.probability >= 1) {
        return callback && callback();
    }
    unattendUser.unattendUser(params.tid, params.uid, function (err, resultCount) {
        if (resultCount) {
            notifications.notifyAutoUnslotted(params.tid, params.uid, resultCount);
        }
        callback && callback();
    });
}

export const admin = {
    menu: function (custom_header, callback: Function) {
        custom_header.plugins.push({
            "route": '/plugins/' + meta.nbbId,
            "icon": 'fa-calendar',
            "name": meta.name
        });

        callback(null, custom_header);
    }
};
