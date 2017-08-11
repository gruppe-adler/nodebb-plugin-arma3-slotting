import {BooleanResultCallback, Users} from '../../types/nodebb';
const users = <Users>require('../../../../src/user');
const groups = require('../../../../src/groups');
const async = require('async');
const _ = require('underscore');

module.exports.getUsers = function (currentUser, userids, callback) {
    users.getUsersWithFields(userids, ['uid', 'username', 'userslug', 'picture', 'icon:bgColor', 'icon:text'], currentUser, callback);
};

export function isModerator(uid: number, cid: number, callback: BooleanResultCallback) {
    async.parallel([
        _.partial(users.isModerator, uid, cid),
        _.partial(users.isAdminOrGlobalMod, uid)
    ], function (err, results) {
        callback(err, results[0] || results[1]);
    });
}

export function getGroups(uid: number, callback) {
    groups.getUserGroups([uid], function (err, groupsForUids) {
        if (err) {
            throw callback(err);
        }

        const groups = groupsForUids[0];

        callback(err, groups.map(function (group) { return group.name}));
    });
}
