"use strict";

const logger = require('../logger');
const _ = require('underscore');
const async = require('async');
const notifications = require('../../../../src/notifications');
const topics = require('./topics');
const slot = require('./slot');
const users = require('./users');

module.exports.notifySlotted = function (match, slotUuid, oldUser, newUser) {
    match = match.match || match;
    async.parallel({
        eventTitle: _.partial(topics.getTitle, match.tid),
        followingUids: _.partial(topics.getFollowers, match.tid)
    }, function (err, data) {
        const eventTitle = data.eventTitle;
        const followingUids = data.followingUids;

        let msg = '%s slotted into "%s"'.replace('%s', newUser.username).replace('%s', eventTitle);
        if (oldUser) {
            msg = '%s slotted into "%s", replacing user %s'.replace('%s', newUser.username).replace('%s', eventTitle).replace(oldUser.username);
        }
        notifications.create({
            bodyShort: msg,
            bodyLong: msg,
            image: newUser.picture,
            nid: 'arma3-slotting:' + match.uuid + ':slotting:' + newUser.uid,
            path: '/topic/' + match.tid,
            tid: match.tid,
            from: newUser.uid

        }, function(err, notification) {
            notifications.push(notification, _.values(followingUids), function (err) {
                if (err) {
                    logger.error(err);
                }
            });
        });

    });
};

module.exports.notifyUnslotted = function (match, slotUuid, oldUser) {
    match = match.match || match;
    async.parallel({
        eventTitle: _.partial(topics.getTitle, match.tid),
        followingUids: _.partial(topics.getFollowers, match.tid)
    }, function (err, data) {
        const eventTitle = data.eventTitle;
        const followingUids = data.followingUids;
        let msg = '%s slotted out of "%s"'.replace('%s', oldUser.username).replace('%s', eventTitle);
        notifications.create({
            bodyShort: msg,
            bodyLong: msg,
            image: oldUser.picture,
            nid: 'arma3-slotting:' + match.uuid + ':slotting:' + oldUser.uid,
            path: '/topic/' + match.tid,
            tid: match.tid,
            from: oldUser.uid
        }, function(err, notification) {
            notifications.push(notification, _.values(followingUids), function (err) {
                if (err) {
                    logger.error(err);
                }
            });
        });

    });
};

module.exports.notifyAutoUnslotted = function (tid, uid, slotCount) {
    async.parallel({
        eventTitle: _.partial(topics.getTitle, tid)
    }, function (err, data) {
        const eventTitle = data.eventTitle;
        let msg = 'You were removed from %s slots in event %s'.replace('%s', slotCount).replace('%s', eventTitle);
        notifications.create({
            bodyShort: msg,
            bodyLong: msg,
            nid: 'arma3-slotting:' + tid + ':auto-slotting:' + uid,
            path: '/topic/' + tid,
            tid: tid,
            from: uid
        }, function(err, notification) {
            notifications.push(notification, [uid], function (err) {
                if (err) {
                    logger.error(err);
                }
            });
        });
    });
};
