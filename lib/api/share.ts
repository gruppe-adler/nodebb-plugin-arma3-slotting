import * as shareDB from "../db/share";
import { INodebbRequest, INodebbResponse } from '../../types/nodebb';
import * as logger from "../logger";
import { isValidShare } from '../db/share';

export function post(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const data = req.body;
    if (!data.reservation) {
        return res.status(400).json({message: "Missing body parameter: reservation"});
    }

    shareDB.insertIntoDb(tid, matchid, data.reservation, (error, result) => {
        if (result) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(error);
        }
    });
}

export function get(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const shareKey = req.params.shareid;
    if (!shareKey) {
        return res.status(400).json({message: "Missing body parameter: shareKey"});
    }

    shareDB.getFromDb(tid, matchid, shareKey, (error, result) => {
        if (error) {
            return res.status(400).json(error);
        } else {
            return res.status(200).json(result);
        }
    });
}

export function getAll(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;

    shareDB.getAllFromDb(tid, matchid, (error, result) => {
        if (error) {
            return res.status(400).json(error);
        } else {
            return res.status(200).json(result);
        }
    });
}

export function getTopicData(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);

    shareDB.getTopic(tid, (error, topic) => {
        return res.status(200).json(topic);
    });
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;

    if (!req.body.reservation) {
        return res.status(400).json({message: "Missing body parameter: reservation"});
    }

    shareDB.delFromDb(tid, matchid, req.body.reservation, (error, result) => {
        if (error) {
            return res.status(400).json(error);
        } else {
            return res.status(200).json({uuid: req.body.uuid});
        }
    });
}
