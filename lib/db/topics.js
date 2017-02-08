"use strict";

const topics = require('../../../../src/topics');
const users = require('./users');

module.exports.exists = topics.exists;

module.exports.isAllowedToEdit = function (uid, tid, callback) {
    topics.getTopicsByTids([tid], uid, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || !result[0]) {
            return callback(null, false);
        }

        const topic = result[0];

        if (topic.isOwner) {
            return callback(null, true);
        }

        users.isModerator(uid, topic.cid, callback);
    });
};

module.exports.getCategoryId = function (tid, callback) {
    topics.getTopicField(tid, 'cid', function (err, cid) {callback(err, Number(cid)); });
};
