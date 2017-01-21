"use strict";

const users = require('../../../../src/user');

module.exports.getUsers = function (currentUser, userids, callback) {
    users.getUsersWithFields(userids, ['uid', 'username', 'userslug', 'picture', 'icon:bgColor', 'icon:text'], currentUser, callback);
};
