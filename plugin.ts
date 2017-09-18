import * as notifications from "./lib/db/notifications";
import {AnyCallback, noop} from "./lib/fn";
import * as unattendUser from "./lib/unattendUser";
const meta = require("./plugin.json");

meta.nbbId = meta.id.replace(/nodebb-plugin-/, "");

export function setup(params, callback): void {
    const adminModule = require("./lib/admin");
    const api = require("./lib/api");
    const actions = require("./lib/actions").default;

    adminModule.init(params, meta, function () {
        api.setAllowedCategories(adminModule.getAllowedCategories());
        api.setApiKey(adminModule.getApiKey());
        api.init(params, callback);
    });

    actions(params, meta, noop);
}

export function catchAttendanceChange(params, callback?: AnyCallback) {
    callback = callback || noop;
    if (params.probability >= 1) {
        return callback(null, null);
    }
    unattendUser.unattendUser(params.tid, params.uid, function (err, resultCount) {
        if (resultCount) {
            notifications.notifyAutoUnslotted(params.tid, params.uid, resultCount);
        }
        callback(null, null);
    });
}

export const admin = {
    menu(customHeader, callback: AnyCallback) {
        customHeader.plugins.push({
            icon: "fa-calendar",
            name: meta.name,
            route: "/plugins/" + meta.nbbId,
        });

        callback(null, customHeader);
    },
};