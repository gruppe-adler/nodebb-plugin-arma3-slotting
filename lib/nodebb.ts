import {IDb, IPlugins, ITopics, IUserGroups, IUsers} from "../types/nodebb";
import * as nodebb from '../types/nodebb';

export const user = require.main.require('./src/user') as IUsers
export const groups = require.main.require('./src/groups') as IUserGroups
export const notifications = require.main.require("./src/notifications");
export const topics = require.main.require("./src/topics") as ITopics;
export const db: IDb = require.main.require("./src/database") as IDb;
export const socketio = require.main.require('./src/socket.io');
export const Meta = require.main.require("./src/meta") as nodebb.IMeta;
export const plugins = require.main.require("./src/plugins") as IPlugins;
