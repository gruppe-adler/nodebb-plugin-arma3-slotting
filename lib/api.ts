"use strict";

import {RequestHandler, Response, Router} from "express";
import {INodebbRequest} from "../types/nodebb";

import * as slottedUsersApi from "./api/slotted-users";
import * as matchApi from "./api/match";
import * as shareApi from "./api/share";
import * as reservationApi from "./api/reservations";
import * as slotApi from "./api/slot";
import * as userApi from "./api/users";
import * as topicDb from "./db/topics";
import * as shareDb from "./db/share";
import * as userDb from "./db/users";
import * as logger from "./logger";
import * as bodyParser from 'body-parser';
import {IPluginSettings} from './../lib/admin';
import {Meta as meta} from './nodebb';

const canAttend = require("../../nodebb-plugin-attendance/lib/permissions").canAttend;
const canSee = require("../../nodebb-plugin-attendance/lib/permissions").canSee;


const prefixApiPath = function (path) {
    return "/api/arma3-slotting" + path;
};

let config: IPluginSettings;

const exceptionToErrorResponse = function (e) {
    return {
        message: e.message,
    };
};

const topicIsEvent = (title) => {
    return title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})([^0-9a-z])/i);
};

const secondsToEvent = function (title) {
    const dateParts = title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})( [0-9:+ ])?[^0-9a-z]/i);
    if (!dateParts || !dateParts[0]) {
        return -1;
    }

    const eventDate = new Date(dateParts[0]);

    if (!dateParts[2]) {// if no time part was entered, assume next day
        eventDate.setTime(eventDate.getTime() + 86400 * 1000);
    }

    return (eventDate.getTime() - (new Date().getTime())) / 1000;
};

const requireEventInFuture = function (req: INodebbRequest, res: Response, next) {
    topicDb.getTitle(Number(req.params.tid)).then(title => {
        if (!title) {
            return res
                .status(404)
                .json({message: "topic %d does not exist or doesnt have a title oO".replace("%d", req.params.tid)});
        }
        if (!topicIsEvent(title)) {
            return res
                .status(404)
                .json({message: "topic %d is no event".replace("%d", req.params.tid)});
        }
        if (secondsToEvent(title) < 0) {
            return res
                .status(403)
                .json({message: "too late. event start of %d is passed".replace("%d", req.params.tid)});
        }

        next();
    }).catch(err => {
        return res.status(500).json(exceptionToErrorResponse(err));
    });
};

const requireTopic = function (req: INodebbRequest, res: Response, next) {
    topicDb.exists(Number(req.params.tid)).then(result => {
        if (!result) {
            return res.status(404).json({message: "topic %d does not exist".replace("%d", req.params.tid)});
        }
        next();
    }).catch(err => {
        return res.status(500).json(exceptionToErrorResponse(err));
    });
};

const getConfig = function (req: INodebbRequest, res: Response, next) {
    res.status(200).json({ // take care *not* to pass the apiKey ^^
        slottingUiUrl: config.slottingUiUrl,
        allowedCategories: config.allowedCategories,
    });
};

const restrictCategories = function (req: INodebbRequest, res: Response, next) {
    if (config.allowedCategories.length === 0) {
        next(); return;
    }

    topicDb.getCategoryId(Number(req.params.tid)).then(cid => {
        if (config.allowedCategories.indexOf(cid) === -1) {
            return res.status(404).json({message: "API disabled for this category"});
        }

        next();
    }).catch(err => {
        return res.status(500).json(exceptionToErrorResponse(err));
    });
};

const requireLoggedIn = function (req: INodebbRequest, res: Response, next) {
    if (config.apiKey && (req.header("X-Api-Key") === config.apiKey)) {
        next(); return;
    }

    if (req.body.shareKey && req.body.reservation) {
        next(); return;
    }

    if (req.uid) {
        next(); return;
    }
    return res.status(401).json({message: "plz log in to access this API"});
};

const requireCanSeeAttendance = function (req: INodebbRequest, res: Response, next) {
    const shareid = req.header("X-Share-Key") || req.params.shareid;
    if (shareid) {
        shareDb.isValidShare(Number(req.params.tid), req.params.matchid, shareid).then(result => {
            if (result === "none") {
                return res.status(403).json({message: "Invalid reservation or share id"});
            } else {
                next();
                return;
            }
        });
    } else {
        canSee(req.uid, req.params.tid).then(result => {
            if (result) {
                next();
                return;
            }
            return res.status(403).json({message: "you are not allowed to see this"});
        }).catch(err => {throw err});
    }
};

const requireCanWriteAttendance = function (req: INodebbRequest, res: Response, next) {
    const shareid = req.header("X-Share-Key") || req.params.shareid;
    if (shareid) {
        shareDb.isValidShare(Number(req.params.tid), req.params.matchid, shareid).then(result => {
            if (result === "none") {
                return res.status(403).json({message: "Invalid reservation or share id"});
            } else {
                next();
                return;
            }
        });
    } else {
        canAttend(req.uid, req.params.tid).then(result => {
            if (result) {
                next(); return;
            }
            return res.status(403).json({message: "you are not allowed to edit this"});
        }).catch(err => {
            throw err;
        });
    }
};

const requireAdminOrThreadOwner = function (req: INodebbRequest, res: Response, next) {
    const tid = parseInt(req.params.tid, 10);
    const uid = req.uid;

    if (config.apiKey && (req.header("X-Api-Key") === config.apiKey)) {
        next(); return;
    }

    if (!tid || !uid) {
        return res.status(400).json({message: "must be logged in and provide topic id"});
    }

    topicDb.isAllowedToEdit(req.uid, tid).then(result => {
        if (!result) {
            logger.error("user " + req.uid + " tried to edit topic " + tid);
            return res.status(403).json({message: "You're not admin or owner of this topic"});
        }

        next();
    }).catch(err => {
        return res.status(500).json(err);
    });
};

const isAdminOrThreadOwner = function (req: INodebbRequest, res) {
    const tid = parseInt(req.params.tid, 10);
    const uid = req.uid;
    const reqApiKey = req.header("X-Api-Key");

    if (reqApiKey) {
        return res.status(200).json({result: reqApiKey === config.apiKey});
    }

    if (!uid) {
        return res.status(200).json({result: false, message: "you're not logged in, btw"});
    }

    if (!tid) {
        return res.status(400).json({error: "must provide topic id"});
    }

    topicDb.isAllowedToEdit(req.uid, tid).then(hasAdminPermission => {
        userDb.getGroups([req.uid]).then(groups => {
            return res.status(200).json({
                groups: groups[req.uid],
                result: hasAdminPermission,
            });
        }).catch(error => {
            return res.status(500).json(error);
        });
    }).catch(err => {
        return res.status(500).json(err);
    });
};

const returnSuccess: RequestHandler = function (req: INodebbRequest, res: Response) {
    res.status(200).json({});
};

const getApiMethodGenerator = function (router: Router, methodName: string) {
    return function (path: string, cb1?: RequestHandler, cb2?: RequestHandler, cb3?: RequestHandler) {
        const cbs: RequestHandler[] = Array.prototype.slice.call(arguments, 1);
        cbs.forEach(function (cb) {
            router[methodName](prefixApiPath(path), cb);
        });
    };
};

const optionsHandle = function (req: INodebbRequest, res: Response) {
    const headers = {};
    headers["Access-Control-Allow-Origin"] = encodeURI(meta.config['access-control-allow-origin'] || '*');
    headers["Access-Control-Allow-Methods"] = encodeURI(meta.config['access-control-allow-methods'] || '');
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = encodeURI(meta.config['access-control-allow-headers'] || '');
    res.writeHead(200, headers);
    res.end();
};

const setGlobalHeaders = function (req: INodebbRequest, res: Response, next) {
    res.setHeader("Access-Control-Allow-Credentials", 'true');
    next();
};

export async function init(params): Promise<void> {
    const get = getApiMethodGenerator(params.router, "get");
    const pos = getApiMethodGenerator(params.router, "post");
    const del = getApiMethodGenerator(params.router, "delete");
    const put = getApiMethodGenerator(params.router, "put");
    const options = getApiMethodGenerator(params.router, "options");
    const all = getApiMethodGenerator(params.router, "all");

    get("/config", getConfig);

    options("/:tid/*", optionsHandle);
    
    all("*", bodyParser.text({type: "application/xml"})); 
    all("/:tid/*", setGlobalHeaders);
    all("/:tid", requireTopic, restrictCategories);
    all("/:tid", requireTopic, restrictCategories);
    all("/:tid/*", requireTopic, restrictCategories);
    pos("/:tid/*", requireLoggedIn, restrictCategories, requireEventInFuture);
    put("/:tid/*", requireLoggedIn, restrictCategories, requireEventInFuture);
    del("/:tid/*", requireLoggedIn, restrictCategories, requireEventInFuture);

    get("/:tid", requireCanSeeAttendance, matchApi.getAll);

    get("/:tid/slotted-user-ids", requireCanSeeAttendance, slottedUsersApi.get);
    get("/:tid/has-permissions", isAdminOrThreadOwner, returnSuccess);

    pos("/:tid/match", requireAdminOrThreadOwner, matchApi.post);

    put("/:tid/match/:matchid", requireAdminOrThreadOwner, matchApi.put);
    get("/:tid/match/:matchid", requireCanSeeAttendance, matchApi.get);
    del("/:tid/match/:matchid", requireAdminOrThreadOwner, matchApi.del);

    // get("/:tid/match/:matchid/share", requireAdminOrThreadOwner, shareApi.getAll);
    get("/:tid/match/:matchid/share/:shareid/topic", requireCanSeeAttendance, shareApi.getTopicData);
    get("/:tid/match/:matchid/share/:shareid", requireTopic, shareApi.get);
    pos("/:tid/match/:matchid/share", requireAdminOrThreadOwner, shareApi.post);
    del("/:tid/match/:matchid/share", requireAdminOrThreadOwner, shareApi.del);

    get("/:tid/match/:matchid/slot", requireCanSeeAttendance, slotApi.getAll);

    put("/:tid/match/:matchid/slot/:slotid/user", requireCanWriteAttendance, userApi.put); // security in action method!
    del("/:tid/match/:matchid/slot/:slotid/user", requireCanWriteAttendance, userApi.del); // security in action method!
    get("/:tid/match/:matchid/slot/:slotid/user", requireCanSeeAttendance, userApi.get);

    put("/:tid/match/:matchid/slot/:slotid/reservation", requireAdminOrThreadOwner, reservationApi.put);
    del("/:tid/match/:matchid/slot/:slotid/reservation", requireAdminOrThreadOwner, reservationApi.del);
    get("/:tid/match/:matchid/slot/:slotid/reservation", requireCanSeeAttendance, reservationApi.get);
}

export function setConfig(newConfig: IPluginSettings) {
    config = newConfig;
}
