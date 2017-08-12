"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users = require('../../../../src/user');
var groups = require('../../../../src/groups');
var async = require('async');
var _ = require('underscore');
module.exports.getUsers = function (currentUser, userids, callback) {
    users.getUsersWithFields(userids, ['uid', 'username', 'userslug', 'picture', 'icon:bgColor', 'icon:text'], currentUser, callback);
};
function isModerator(uid, cid, callback) {
    async.parallel([
        _.partial(users.isModerator, uid, cid),
        _.partial(users.isAdminOrGlobalMod, uid)
    ], function (err, results) {
        callback(err, results[0] || results[1]);
    });
}
exports.isModerator = isModerator;
function getGroups(uid, callback) {
    groups.getUserGroups([uid], function (err, groupsForUids) {
        if (err) {
            throw callback(err);
        }
        var groups = groupsForUids[0];
        callback(err, groups.map(function (group) { return group.name; }));
    });
}
exports.getGroups = getGroups;
