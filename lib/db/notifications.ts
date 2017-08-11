import * as logger from '../logger';
import * as _ from 'underscore';
import * as async from 'async';
import * as topics from './topics';
import {MatchWrapper, Match} from './match'
import {User} from '../../types/nodebb'

const notifications = require('../../../../src/notifications');

export function notifySlotted(matchWrapper: MatchWrapper, oldUser: User, newUser: User) {
    const match = <Match>(matchWrapper.match || matchWrapper);
    async.parallel({
        eventTitle: _.partial(topics.getTitle, match.tid),
        followingUids: _.partial(topics.getFollowers, match.tid)
    }, function (err: Error, data: {eventTitle: string, followingUids: any}) {
        const eventTitle = data.eventTitle;
        const followingUids = data.followingUids;

        let msg = '%s slotted into "%s"'.replace('%s', newUser.username).replace('%s', eventTitle);
        if (oldUser) {
            msg = '%s slotted into "%s", replacing user %s'.replace('%s', newUser.username).replace('%s', eventTitle).replace('%s', oldUser.username);
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
}

export function notifyUnslotted(matchWrapper: MatchWrapper, oldUser: User) {
    const match = <Match>(matchWrapper.match || matchWrapper);
    async.parallel({
        eventTitle: _.partial(topics.getTitle, match.tid),
        followingUids: _.partial(topics.getFollowers, match.tid)
    }, function (err, data) {
        const eventTitle = <string>data.eventTitle;
        const followingUids = <any>data.followingUids;
        let msg = '%s slotted out of "%s"'
            .replace('%s', oldUser.username)
            .replace('%s', eventTitle);

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
}

export function notifyAutoUnslotted(tid, uid, slotCount) {
    async.parallel({
        eventTitle: _.partial(topics.getTitle, tid)
    }, function (err: Error, data: any) {
        const eventTitle = <string>data.eventTitle;
        let msg = 'You were removed from %s slots in event %s'
            .replace('%s', slotCount)
            .replace('%s', eventTitle);

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
}
