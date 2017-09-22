import {parallel} from "async";
import {MatchRepository, matchRepository} from "../db/match";
import {getMatchUsers, Slot2User} from "../db/slot";
import {partial, values} from 'underscore';

export class EventRepository {
    constructor(private matchRepository: MatchRepository) {}
    getSlottedUserIds(tid: number, callback: (error: Error, userIds: number[]) => void): void {
        this.matchRepository.getMatchIds(tid, (err: Error, matchIds: string[]) => {
            parallel(
                matchIds.map((matchId: string) => partial(getMatchUsers, tid, matchId)),
                (err: Error, slot2user: Slot2User[]) => {
                    if (err) {
                        return callback(err, null);
                    }
                    let userIds = [];
                    slot2user.forEach((map: Slot2User) => {
                        userIds = userIds.concat(values(map))
                    });
                    callback(err, userIds);
                }
            );
        })
    }
}

export const eventRepository = new EventRepository(matchRepository);
