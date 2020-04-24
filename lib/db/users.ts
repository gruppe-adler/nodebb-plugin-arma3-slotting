import {IUserGroup, IUsers} from "../../types/nodebb";
import {IMatchOutputUser} from "../match";

const nodebbUsersModule = require("../../../../src/user") as IUsers;
const nodebbGroupsModule = require("../../../../src/groups");

export async function getUsers(
    currentUser: number,
    userids: number[]
): Promise<IMatchOutputUser[]> {
    const [groups, users] = await Promise.all([
        getGroups(userids),
        nodebbUsersModule.getUsersWithFields(userids,
                ["uid", "username", "userslug", "picture", "icon:bgColor", "icon:text", "groupTitle"],
                currentUser
            )
        ]);

    return users.map(user => {
       user.uid = Number(user.uid);
       (user as IMatchOutputUser).groups = groups[user.uid];
       return user as IMatchOutputUser;
   });
}

export async function isModerator(uid: number, cid: number): Promise<boolean> {
    const results = await Promise.all([
        nodebbUsersModule.isModerator(uid, cid),
        nodebbUsersModule.isAdminOrGlobalMod(uid)
    ])
    return results[0] || results[1]
}

export async function getGroups(uids: number[]): Promise<{[uid: number]: string[]}> {
    const groupsForUids: IUserGroup[][] = await nodebbGroupsModule.getUserGroups(uids);
    const groupMap = {};
    groupsForUids.forEach((groups: IUserGroup[], idx: number) => {
        groupMap[uids[idx]] = groups.map(_ => _.name);
    });

    return groupMap;
}
