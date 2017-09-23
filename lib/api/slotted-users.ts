import {INodebbRequest, INodebbResponse} from "../../types/nodebb";
import {eventRepository} from "../db/event";

export function get(req: INodebbRequest, res: INodebbResponse, next) {
    const tid = Number(req.params.tid);
    if (!tid) {
        return res.status(400).send({message: 'missing or invalid tid parameter'});
    }
    eventRepository.getSlottedUserIds(tid, (err: Error, userIds: number[]) => {
        return res.status(200).send(userIds);
    });
}
