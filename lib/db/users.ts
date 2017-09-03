import * as async from "async";
import * as  _ from "underscore";

import {BooleanResultCallback, IUsers} from "../../types/nodebb";
import {AnyCallback} from "../fn";

const nodebbUsersModule = require("../../../../src/user") as IUsers;
const nodebbGroupsModule = require("../../../../src/groups");

export function getUsers(currentUser: number, userids: number[], callback: AnyCallback) {
    nodebbUsersModule.getUsersWithFields(
        userids,
        ["uid", "username", "userslug", "picture", "icon:bgColor", "icon:text"],
        currentUser,
        callback,
    );
}

export function isModerator(uid: number, cid: number, callback: BooleanResultCallback) {
    async.parallel([
        _.partial(nodebbUsersModule.isModerator, uid, cid),
        _.partial(nodebbUsersModule.isAdminOrGlobalMod, uid),
    ], function (err, results) {
        callback(err, results[0] || results[1]);
    });
}

export function getGroups(uid: number, callback) {
    nodebbGroupsModule.getUserGroups([uid], function (err, groupsForUids) {
        if (err) {
            throw callback(err);
        }

        const groups = groupsForUids[0];

        callback(err, groups.map(function (group) { return group.name; }));
    });
}
