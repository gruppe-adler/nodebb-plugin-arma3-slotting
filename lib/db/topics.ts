import {ITopics} from "../../types/nodebb";
import * as users from "./users";

const topics = require("../../../../src/topics") as ITopics;

export async function exists(tid: number) {
    return topics.exists(tid);
}

export async function getFollowers(uid: number) {
    return topics.getFollowers(uid);
}

export async function getTitle(tid: number) {
    return topics.getTopicField(tid, "title");
}

export async function isAllowedToEdit(uid: number, tid: number): Promise<Boolean> {
    const result = await topics.getTopicsByTids([tid], uid);
    if (!result || !result[0]) {
        return false;
    }

    const topic = result[0];

    if (topic.isOwner) {
        return true;
    }

     return users.isModerator(uid, topic.cid);
}

export async function getCategoryId(tid: number): Promise<number> {
    const cid = await topics.getTopicField(tid, "cid");

    return Number(cid);
}
