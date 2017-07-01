
const winston = require('winston');
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
        attendingUids: _.partial(slot.getMatchUsers, match.tid, match.uuid)
    }, function (err, data) {
        var eventTitle = data.eventTitle;
        var attendingUids = data.attendingUids;

        var msg = 'User %s slotted into "%s"'.replace('%s', newUser.username).replace('%s', eventTitle);
        if (oldUser) {
            msg = 'User %s slotted into "%s", replacing user %s'.replace('%s', newUser.username).replace('%s', eventTitle).replace(oldUser.username);
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
            notifications.push(notification, _.values(attendingUids), function (err) {
                if (err) {
                    winston.error(err);
                }
            });
        });

    });
};

module.exports.notifyUnslotted = function (match, slotUuid, oldUser) {
    match = match.match || match;
    async.parallel({
        eventTitle: _.partial(topics.getTitle, match.tid),
        attendingUids: _.partial(slot.getMatchUsers, match.tid, match.uuid)
    }, function (err, data) {
        var eventTitle = data.eventTitle;
        var attendingUids = data.attendingUids;
        var msg = 'User %s slotted out of "%s"'.replace('%s', oldUser.username).replace('%s', eventTitle);
        notifications.create({
            bodyShort: msg,
            bodyLong: msg,
            image: oldUser.picture,
            nid: 'arma3-slotting:' + match.uuid + ':slotting:' + oldUser.uid,
            path: '/topic/' + match.tid,
            tid: match.tid,
            from: oldUser.uid
        }, function(err, notification) {
            notifications.push(notification, _.values(attendingUids), function (err) {
                if (err) {
                    winston.error(err);
                }
            });
        });

    });
};
