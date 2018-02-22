import * as logger from "../logger";
import * as shareDB from "../db/share";
import { INodebbRequest, INodebbResponse } from '../../types/nodebb';
import { partial } from 'underscore';
import * as async from 'async';


export function post(req: INodebbRequest, res: INodebbResponse) {
    const tid = +req.params.tid;
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
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const shareid = req.params.shareid;

    shareDB.getFromDb(tid, matchid, shareid, (error, result) => {
        if (error) {
            return res.status(400).json(error);
        } else {
            return res.status(200).json({uuid: shareid, reservation: result});
        }
    });
}

export function getAll(req: INodebbRequest, res: INodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;

    shareDB.getAllFromDb(tid, matchid, (error, result) => {
        if (error) {
            return res.status(400).json(error);
        } else {
            return res.status(200).json(result);
        }
    });
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;

    if (!req.body.reservation) {
        return res.status(400).json({message: "Missing body parameter: reservation"});
    }

    shareDB.delFromDb(tid, matchid, req.body.reservation, (error, result) => {
        logger.info(error);
        logger.info(result);
        if (error) {
            return res.status(400).json(error);
        } else {
            return res.status(200).json({uuid: req.body.uuid});
        }
    });
}