import * as notifications from "./lib/db/notifications";
import {AnyCallback, noop} from "./lib/fn";
import * as unattendUser from "./lib/unattendUser";
import {eventRepository} from "./lib/db/event";
const meta = require("./plugin.json");

meta.nbbId = meta.id.replace(/nodebb-plugin-/, "");

export function setup(params, callback): void {
    const adminModule = require("./lib/admin");
    const api = require("./lib/api");
    const actions = require("./lib/actions").default;
    const websocket = require("./lib/websocket");

    adminModule.init(params, meta, function () {
        api.setAllowedCategories(adminModule.getAllowedCategories());
        api.setApiKey(adminModule.getApiKey());
        api.init(params, callback);
    });

    actions(params, meta, noop);
    websocket.init();
}

export function catchAttendanceChange(params, callback?: AnyCallback): void {
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

export function filterAttendanceSlotted(params, callback: (err: Error, userIds: number[])=> void): void {
    const tid = params.tid;

    eventRepository.getSlottedUserIds(tid, (error, userIds) => {
        params.userIds = userIds;
        callback(error, userIds);
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
