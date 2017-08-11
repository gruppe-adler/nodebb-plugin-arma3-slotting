import {NodebbRequest, NodebbResponse} from '../../types/nodebb';
import * as slotDb from '../db/slot';
import * as logger from '../logger';

export function get(req: NodebbRequest, res: NodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    slotDb.getMatchReservations(tid, matchid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }
        if (!result) {
            return res.status(404).json(null);
        }

        if (!result[slotid]) {
            return res.status(404).json(null);
        }

        return res.status(200).json(result[slotid]);
    });
}

export function put(req: NodebbRequest, res: NodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    let model = req.body;
    if (!model['reserved-for']) {
        return res.status(400).json({"message": "missing reservation string 'reserved-for'"});
    }

    slotDb.putSlotReservation(tid, matchid, slotid, model['reserved-for'], function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }
        logger.info('reservation put for match %s, slot %s'.replace('%s', matchid).replace('%s', slotid));
        return res.status(204).json(null);
    });
}

export function del(req: NodebbRequest, res: NodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    slotDb.deleteSlotReservation(tid, matchid, slotid, function (err) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(204).json(null);
    });
}
