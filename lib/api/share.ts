import * as logger from "../logger";
import * as shareDB from "../db/share";
import { INodebbRequest, INodebbResponse } from '../../types/nodebb';
import { partial } from 'underscore';
import * as async from 'async';


export function post(req: INodebbRequest, res: INodebbResponse) {
    const tid = +req.params.tid;
    const matchid = req.params.matchid;
    const data = req.body;
    if (!data.target) {
        return res.status(400).json();
    }

    return res.status(200).json();
}

export function get(req: INodebbRequest, res: INodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;

    return res.status(200).json(tid);
}

export function getAll(req: INodebbRequest, res: INodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const shareid = req.params.shareid;

    return res.status(200).json(shareid);
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
}

export class Share {
    uuid: string;
    name: string;
    tid: number;
    matchid: string;
}