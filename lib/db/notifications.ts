import * as async from "async";
import * as _ from "underscore";
import {IUser} from "../../types/nodebb";
import * as logger from "../logger";
import {Match} from "../match";
import * as topics from "./topics";

const notifications = require("../../../../src/notifications");

export async function notifySlotted(matchWrapper: { tid: number, match: Match }, oldUser: IUser, newUser: IUser) {
    const tid = matchWrapper.tid;
    const [eventTitle, followingUids] = await Promise.all([
        topics.getTitle(tid),
        topics.getFollowers(tid),
    ]);

    let msg = '%s slotted into "%s"'.replace("%s", newUser.username).replace("%s", eventTitle);
    if (oldUser) {
        msg = '%s slotted into "%s", replacing user %s'
            .replace("%s", newUser.username)
            .replace("%s", eventTitle)
            .replace("%s", oldUser.username);
    }
    notifications.create(
        {
            bodyLong: msg,
            bodyShort: msg,
            from: newUser.uid,
            image: newUser.picture,
            nid: "arma3-slotting:" + matchWrapper.match.uuid + ":slotting:" + newUser.uid,
            path: "/topic/" + tid,
            tid,
        },
        function (error: Error, notification) {
            notifications.push(notification, _.values(followingUids), function (error3: Error) {
                if (error3) {
                    logger.error(error3.message, error3);
                }
            });
        });
}

export function notifySlottedExternal(matchWrapper: { tid: number, match: Match }, oldUser: string, newUser: string) {
    const tid = matchWrapper.tid;
    async.parallel({
        eventTitle: _.partial(topics.getTitle, tid),
        followingUids: _.partial(topics.getFollowers, tid),
    }, function (err: Error, data: { eventTitle: string, followingUids: any }) {
        const eventTitle = data.eventTitle;
        const followingUids = data.followingUids;

        let msg = '%s slotted into "%s"'.replace("%s", newUser).replace("%s", eventTitle);
        if (oldUser) {
            msg = '%s slotted into "%s", replacing user %s'
                    .replace("%s", newUser)
                    .replace("%s", eventTitle)
                    .replace("%s", oldUser);
        }
        notifications.create(
                {
                    bodyLong: msg,
                    bodyShort: msg,
                    nid: "arma3-slotting:" + matchWrapper.match.uuid + ":slotting:" + newUser,
                    path: "/topic/" + tid,
                    tid,
                },
                function (error: Error, notification) {
                    notifications.push(notification, _.values(followingUids), function (error3: Error) {
                        if (error3) {
                            logger.error(error3.message, error3);
                        }
                    });
                });
    });
}

export function notifyUnslotted(matchWrapper: {tid: number, match: Match}, oldUser: IUser) {
    const tid = matchWrapper.tid;
    async.parallel({
        eventTitle: _.partial(topics.getTitle, tid),
        followingUids: _.partial(topics.getFollowers, tid),
    }, function (err, data) {
        const eventTitle = data.eventTitle as string;
        const followingUids = data.followingUids as any;
        const msg = '%s slotted out of "%s"'
            .replace("%s", oldUser.username)
            .replace("%s", eventTitle);

        notifications.create({
            bodyLong: msg,
            bodyShort: msg,
            from: oldUser.uid,
            image: oldUser.picture,
            nid: "arma3-slotting:" + matchWrapper.match.uuid + ":slotting:" + oldUser.uid,
            path: "/topic/" + tid,
            tid,
        }, function (error, notification) {
            notifications.push(notification, _.values(followingUids), function (error3) {
                if (error3) {
                    logger.error(error3.message, error3);
                }
            });
        });

    });
}

export function notifyUnslottedExternal(matchWrapper: {tid: number, match: Match}, oldUser: string) {
    const tid = matchWrapper.tid;
    async.parallel({
        eventTitle: _.partial(topics.getTitle, tid),
        followingUids: _.partial(topics.getFollowers, tid),
    }, function (err, data) {
        const eventTitle = data.eventTitle as string;
        const followingUids = data.followingUids as any;
        const msg = '%s slotted out of "%s"'
                .replace("%s", oldUser)
                .replace("%s", eventTitle);

        notifications.create({
            bodyLong: msg,
            bodyShort: msg,
            nid: "arma3-slotting:" + matchWrapper.match.uuid + ":slotting:" + oldUser,
            path: "/topic/" + tid,
            tid,
        }, function (error, notification) {
            notifications.push(notification, _.values(followingUids), function (error3) {
                if (error3) {
                    logger.error(error3.message, error3);
                }
            });
        });

    });
}

export function notifyAutoUnslotted(tid, uid, slotCount) {
    async.parallel({
        eventTitle: _.partial(topics.getTitle, tid),
    }, function (err: Error, data: any) {
        const eventTitle = data.eventTitle as string;
        const msg = "You were removed from %s slots in event %s"
            .replace("%s", slotCount)
            .replace("%s", eventTitle);

        notifications.create({
            bodyLong: msg,
            bodyShort: msg,
            from: uid,
            nid: "arma3-slotting:" + tid + ":auto-slotting:" + uid,
            path: "/topic/" + tid,
            tid,
        }, function (err2, notification) {
            notifications.push(notification, [uid], function (err3: Error) {
                if (err3) {
                    logger.error(err3.message, err3);
                }
            });
        });
    });
}
