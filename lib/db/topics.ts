import {BooleanResultCallback, ITopics} from "../../types/nodebb";
import * as users from "./users";

const topics = require("../../../../src/topics") as ITopics;

export function exists(tid: number, cb) {
    return topics.exists(tid, cb);
}

export function getFollowers(uid: number, cb) {
    topics.getFollowers(uid, cb);
}

export function getTitle(tid: number, callback) {
    return topics.getTopicField(tid, "title", callback);
}

export function isAllowedToEdit(uid: number, tid: number, callback: BooleanResultCallback) {
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
}

export function getCategoryId(tid: number, callback) {
    topics.getTopicField(tid, "cid", function (err, cid) {callback(err, Number(cid)); });
}
