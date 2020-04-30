import {noop} from "../fn";

import {INodebbRequest, INodebbResponse, IPlugins} from "../../types/nodebb";
import * as matchDb from "../db/match";
import * as notifications from "../db/notifications";
import * as slotDb from "../db/slot";
import * as topicDb from "../db/topics";
import * as shareDb from "../db/share";
import * as users from "../db/users";
import * as logger from "../logger";
import {IMatchOutputUser} from '../match';
import {socketio, plugins} from '../nodebb';

const websocket = socketio.server.of('/slotting');

async function getSingleUser(currentUser: number, requestedUserid: number): Promise<IMatchOutputUser> {
    const resultUsers = await users.getUsers(currentUser, [requestedUserid])
    return resultUsers.shift()
}

export function get(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    slotDb.getMatchUsers(tid, matchid).then(result => {
        if (!result) {
            return res.status(404).json(null);
        }
        if (!result[slotid]) {
            return res.status(404).json(null);
        }

        return res.status(200).json(result[slotid]);
    }).catch(err => {
        return res.status(500).json(err);
    });
}



export function put(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid: string = req.params.matchid;
    const slotid: string = req.params.slotid;

    if (req.body.shareKey) {
        return putExtern(req, res);
    }

    const uid = Number(req.body.uid);
    if (!uid) {
        return res.status(400).json({message: "missing user id 'uid'"});
    }

    Promise.all([
        topicDb.isAllowedToEdit(req.uid, tid),
        matchDb.getFromDb(tid, matchid),
        getSlotUser(tid, matchid, slotid, req.uid),
        getSingleUser(req.uid, uid)
    ]).then((results) => {
        let [isTopicAdmin, match, currentlySlottedUser, newUser] = results;

        if (!isTopicAdmin) {
            if (currentlySlottedUser) {
                return res.status(403).json({message: "Slot is already taken!"});
            }
            if (req.uid !== uid) {
                return res.status(403).json({message: "You cant slot other users!"});
            }
        }
        if (!match) {
            return res.status(404).json({message: "match %s not found".replace("%s", matchid)});
        }

        slotDb.putSlotUser(tid, matchid, slotid, uid).then(() => {
            logger.info("user put for match %s, slot %s".replace("%s", matchid).replace("%s", slotid));
            notifications.notifySlotted({match, tid}, currentlySlottedUser, newUser).then(noop);
            plugins.fireHook("action:arma3-slotting.set", {tid, uid, matchid}, noop);

            websocket.emit('event:user-slotted', {
                tid: tid,
                matchid: matchid,
                slot: slotid,
                user: newUser
            });

            return res.status(204).json(null);
        }).catch(error => {
            return res.status(500).json({message: error.message});
        });
    }).catch(err => {
        return res.status(500).json({message: err.message});
    });
}

async function getSlotUser(tid: number, matchid: string, slotid: string, reqUid: number): Promise<IMatchOutputUser> {
    const slotUid = await slotDb.getSlotUser(tid, matchid, slotid)
    if (slotUid) {
        return getSingleUser(reqUid, slotUid);
    } else {
        return
    }
}

export function putExtern(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid: string = req.params.matchid;
    const slotid: string = req.params.slotid;
    const shareid = req.body.shareKey;
    const reservation = req.body.reservation;
    const username = req.body.username;


    Promise.all([
        matchDb.getFromDb(tid, matchid),
        getSlotUser(tid, matchid, slotid, req.uid),
        shareDb.isValidShare(tid, matchid, shareid)
    ]).then((results) => {
        let [match, currentlySlottedUser, shareStatus] = results;

        if (shareStatus === "user") {
            if (currentlySlottedUser) {
                return res.status(403).json({message: "Slot is already taken!"});
            }
        }
        if (!match) {
            return res.status(404).json({message: "match %s not found".replace("%s", matchid)});
        }

        slotDb.putSlotExternUser(tid, matchid, slotid, reservation + ":" + username).then(() => {
            logger.info("user put for match %s, slot %s".replace("%s", matchid).replace("%s", slotid));
            notifications.notifySlottedExternal({match, tid}, currentlySlottedUser.username, '[' + reservation + '] ' + username);
            plugins.fireHook("action:arma3-slotting.setExternal", {tid, username, reservation, matchid}, noop);

            websocket.emit('event:user-slotted', {
                tid: tid,
                matchid: matchid,
                slot: slotid,
                user: <IMatchOutputUser>{
                    uid: -1,
                    username: username,
                    userslug: username,
                    picture: "",
                    "icon:bgColor": "#673ab7",
                    "icon:text": reservation,
                    groupTitle: "",
                    groups: []
                }
            });

            return res.status(204).json();
        }).catch(error => {
            return res.status(500).json({message: error.message});
        });
    }).catch(err => {
        return res.status(500).json({message: err.message});
    }) ;
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    if (req.body.shareKey) {
        return delExtern(req, res);
    }

    Promise.all([
        topicDb.isAllowedToEdit(req.uid, tid),
        matchDb.getFromDb(tid, matchid),
        getSlotUser(tid, matchid, slotid, req.uid),
    ]).then(results => {
        const [isTopicAdmin, match, currentlySlottedUser] = results
        const currentlySlottedUserId = currentlySlottedUser && Number(currentlySlottedUser.uid);

        if ((currentlySlottedUserId !== req.uid) && !isTopicAdmin) {
            return res.status(403).json({message: "You're not allowed to unslot that user."});
        }

        // If there is nobody slotted, just ignore it
        /*
        if (!currentlySlottedUserId) {
            return res.status(404).json({message: "Cant delete. Nobody is slotted there."});
        }*/

        slotDb.deleteSlotUser(tid, matchid, slotid).then(() => {
            notifications.notifyUnslotted({match, tid}, currentlySlottedUser);

            websocket.emit('event:user-unslotted', {
                tid: tid,
                matchid: matchid,
                slot: slotid
            });

            return res.status(204).json(null);
        }).catch(error => {
            return res.status(500).json(error);
        });
    }).catch(err => {
        return res.status(500).json({message: err.message});
    });
}

export function delExtern(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;
    const shareid = req.body.shareKey;
    const reservation = req.body.reservation;
    const username = req.body.username;


    Promise.all([
        //topicDb.isAllowedToEdit(req.uid, tid),
        matchDb.getFromDb(tid, matchid),
        getSlotUser(tid, matchid, slotid, req.uid),
        shareDb.isValidShare(tid, matchid, shareid),
    ]).then(results => {
        const [match, currentlySlottedUser, shareStatus] = results

        if (shareStatus === "none") {
            logger.info('invalid share');
            return res.status(401).json();
        }

        if (typeof currentlySlottedUser !== typeof '') {
            logger.info('wanted to unslot forum user with share key')
            return res.status(401).json();
        }

        // If there is nobody slotted, just ignore it
        /*
        if (!currentlySlottedUserId) {
            return res.status(404).json({message: "Cant delete. Nobody is slotted there."});
        }*/

        slotDb.deleteSlotUser(tid, matchid, slotid).then(() => {
            websocket.emit('event:user-unslotted', {
                tid: tid,
                matchid: matchid,
                slot: slotid
            });

            notifications.notifyUnslottedExternal({match, tid}, '[' + reservation + '] ' + username);
            return res.status(204).json();
        }).catch(error => {
            return res.status(500).json(error);
        });
    }).catch(err => {
        return res.status(500).json({message: err.message});
    });
}
