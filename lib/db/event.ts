import {MatchRepository, matchRepository} from "../db/match";
import {getMatchUsers, Slot2User} from "../db/slot";

export class EventRepository {
    constructor(private matchRepository: MatchRepository) {
    }

    public async getSlottedUserIds(tid: number): Promise<number[]> {
        const matchIds = await this.matchRepository.getMatchIds(tid)

        const slot2user: Slot2User[] = await Promise.all(
            matchIds.map((matchId: string) => getMatchUsers(tid, matchId))
        )

        let userIds = [];
        slot2user.forEach((map: Slot2User) => {
            userIds = userIds.concat(Object.values(map))
        });

        return userIds
    }
}

export const eventRepository = new EventRepository(matchRepository)
