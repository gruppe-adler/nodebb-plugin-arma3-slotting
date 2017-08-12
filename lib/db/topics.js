"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users = require("./users");
var topics = require('../../../../src/topics');
function exists(tid, cb) {
    return topics.exists(tid, cb);
}
exports.exists = exists;
function getFollowers(uid, cb) {
    topics.getFollowers(uid, cb);
}
exports.getFollowers = getFollowers;
function getTitle(tid, callback) {
    return topics.getTopicField(tid, 'title', callback);
}
exports.getTitle = getTitle;
function isAllowedToEdit(uid, tid, callback) {
    topics.getTopicsByTids([tid], uid, function (err, result) {
        if (err) {
            return callback(err);
        }
        if (!result || !result[0]) {
            return callback(null, false);
        }
        var topic = result[0];
        if (topic.isOwner) {
            return callback(null, true);
        }
        users.isModerator(uid, topic.cid, callback);
    });
}
exports.isAllowedToEdit = isAllowedToEdit;
function getCategoryId(tid, callback) {
    topics.getTopicField(tid, 'cid', function (err, cid) { callback(err, Number(cid)); });
}
exports.getCategoryId = getCategoryId;
