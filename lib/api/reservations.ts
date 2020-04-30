import {INodebbRequest, INodebbResponse} from "../../types/nodebb";
import * as matchDb from "../db/match";
import * as logger from "../logger";

export function get(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    matchDb.getMatchReservations(tid, matchid).then((result: {[slotid: string]: string}) => {
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
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    const model = req.body;
    if (!model["reserved-for"]) {
        return res.status(400).json({message: "missing reservation string 'reserved-for'"});
    }

    matchDb.putSlotReservation(tid, matchid, slotid, model["reserved-for"]).then(() => {
        logger.info("reservation put for match %s, slot %s".replace("%s", matchid).replace("%s", slotid));
        return res.status(204).json(null);
    }).catch(err => {
        return res.status(500).json(err);
    });
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    matchDb.deleteSlotReservation(tid, matchid, slotid).then(() => {
        return res.status(204).json(null);
    }).catch(err => {
        return res.status(500).json(err);
    });
}
