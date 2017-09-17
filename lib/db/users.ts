import {parallel} from "async";
import {partial} from "underscore";

import {BooleanResultCallback, IUser, IUserGroup, IUsers} from "../../types/nodebb";
import {AnyCallback} from "../fn";
import {IMatchOutputUser} from "../match";

const nodebbUsersModule = require("../../../../src/user") as IUsers;
const nodebbGroupsModule = require("../../../../src/groups");

export function getUsers(
    currentUser: number,
    userids: number[], callback: (error: Error, users: IMatchOutputUser[]) => void,
) {
    parallel({
        groups: (next) => {
            getGroups(userids, next);
        },
        users: (next: AnyCallback) => {
            nodebbUsersModule.getUsersWithFields(
                userids,
                ["uid", "username", "userslug", "picture", "icon:bgColor", "icon:text", "groupTitle"],
                currentUser,
                next,
            );
        },
    }, (error: Error, results: {users: IUser[], groups: {[uid: number]: string[]}}) => {
        const outputUsers: IMatchOutputUser[] = results.users.map(user => {
            user.uid = Number(user.uid);
            (user as IMatchOutputUser).groups = results.groups[user.uid];
            return user as IMatchOutputUser;
        });
        callback(error, outputUsers);
    });
}

export function isModerator(uid: number, cid: number, callback: BooleanResultCallback) {
    parallel([
        partial(nodebbUsersModule.isModerator, uid, cid),
        partial(nodebbUsersModule.isAdminOrGlobalMod, uid),
    ], function (err, results) {
        callback(err, results[0] || results[1]);
    });
}

export function getGroups(uids: number[], callback: (error: Error, groups: {[uid: number]: string[]}) => void) {
    nodebbGroupsModule.getUserGroups(uids, function (err: Error, groupsForUids: IUserGroup[][]) {
        const groupMap = {};
        if (err) {
            throw callback(err, {});
        }

        groupsForUids.forEach((groups: IUserGroup[], idx: number) => {
            groupMap[uids[idx]] = groups.map(_ => _.name);
        });

        callback(err, groupMap);
    });
}
