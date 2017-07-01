
const winston = require('winston');
const _ = require('underscore');
const async = require('async');
const notifications = require('../../../../src/notifications');
const topics = require('./topics');
const slot = require('./slot');

module.exports.notifySlotted = function (match, slotUuid, oldUser, newUser) {
    match = match.match || match;
    async.parallel({
        eventTitle: _.partial(topics.getTitle, match.tid),
        attendingUids: _.partial(slot.getMatchUsers, match.tid, match.uuid)
    }, function (err, data) {
        var eventTitle = data.eventTitle;
        var attendingUids = data.attendingUids;
        notifications.create({
            bodyShort: 'People moved into or out of slots for event "' + eventTitle + '"',
            bodyLong: 'One or more people moved into or out of slots for event "' + eventTitle + '" (that you also are attending)',
            // image: data.picture,
            nid: 'arma3-slotting:' + match.uuid + ':slotting',
            path: '/topic/' + match.tid
        }, function(err, notification) {
            notifications.push(notification, _.values(attendingUids), function (err) {
                if (err) {
                    winston.error(err);
                }
            });
        });

    });
};
