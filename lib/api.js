"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var matchApi = require("./api/match");
var userApi = require("./api/users");
var userDb = require("./db/users");
var reservationApi = require("./api/reservations");
var slotApi = require("./api/slot");
var topicDb = require("./db/topics");
var logger = require("./logger");
var canAttend = require('../../nodebb-plugin-attendance/lib/admin').canAttend;
var canSee = require('../../nodebb-plugin-attendance/lib/admin').canSee;
var prefixApiPath = function (path) {
    return '/api/arma3-slotting' + path;
};
var apiKey;
var allowedCategories = [];
var exceptionToErrorResponse = function (e) {
    return {
        message: e.message
    };
};
var topicIsEvent = function (title) {
    return title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})([^0-9a-z])/i);
};
var secondsToEvent = function (title) {
    var dateParts = title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})( [0-9:+ ])?[^0-9a-z]/i);
    if (!dateParts || !dateParts[0]) {
        return -1;
    }
    var eventDate = new Date(dateParts[0]);
    if (!dateParts[2]) {
        eventDate.setTime(eventDate.getTime() + 86400 * 1000);
    }
    return (eventDate.getTime() - (new Date().getTime())) / 1000;
};
var requireEventInFuture = function (req, res, next) {
    topicDb.getTitle(req.params.tid, function (err, title) {
        if (err) {
            return res.status(500).json(exceptionToErrorResponse(err));
        }
        if (!title) {
            return res.status(404).json({ "message": "topic %d does not exist or doesnt have a title oO".replace("%d", req.params.tid) });
        }
        if (!topicIsEvent(title)) {
            return res.status(404).json({ "message": "topic %d is no event".replace("%d", req.params.tid) });
        }
        if (secondsToEvent(title) < 0) {
            return res.status(403).json({ "message": "too late. event start of %d is passed".replace("%d", req.params.tid) });
        }
        next();
    });
};
var requireTopic = function (req, res, next) {
    topicDb.exists(req.params.tid, function (err, result) {
        if (err) {
            return res.status(500).json(exceptionToErrorResponse(err));
        }
        if (!result) {
            return res.status(404).json({ "message": "topic %d does not exist".replace("%d", req.params.tid) });
        }
        next();
    });
};
var methodNotAllowed = function (req, res) {
    res.status(405).json({ "message": "Method not allowed" });
};
var restrictCategories = function (req, res, next) {
    if (allowedCategories.length === 0) {
        next();
        return;
    }
    topicDb.getCategoryId(req.params.tid, function (err, cid) {
        if (err) {
            return res.status(500).json(exceptionToErrorResponse(err));
        }
        if (allowedCategories.indexOf(cid) === -1) {
            return res.status(404).json({ message: "API disabled for this category" });
        }
        next();
    });
};
var requireLoggedIn = function (req, res, next) {
    if (apiKey && (req.header('X-Api-Key') === apiKey)) {
        next();
        return;
    }
    if (req.uid) {
        next();
        return;
    }
    return res.status(401).json({ "message": "plz log in to access this API" });
};
var requireCanSeeAttendance = function (req, res, next) {
    canSee(req.uid, req.params.tid, function (err, result) {
        if (err) {
            throw err;
        }
        if (result) {
            next();
            return;
        }
        return res.status(403).json({ "message": "you are not allowed to see this" });
    });
};
var requireCanWriteAttendance = function (req, res, next) {
    canAttend(req.uid, req.params.tid, function (err, result) {
        if (err) {
            throw err;
        }
        if (result) {
            next();
            return;
        }
        return res.status(403).json({ "message": "you are not allowed to edit this" });
    });
};
var requireAdminOrThreadOwner = function (req, res, next) {
    var tid = parseInt(req.params.tid, 10);
    var uid = req.uid;
    if (apiKey && (req.header('X-Api-Key') === apiKey)) {
        next();
        return;
    }
    if (!tid || !uid) {
        return res.status(400).json({ "message": "must be logged in and provide topic id" });
    }
    topicDb.isAllowedToEdit(req.uid, tid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }
        if (!result) {
            logger.error("user " + req.uid + " tried to edit topic " + tid);
            return res.status(403).json({ "message": "You're not admin or owner of this topic" });
        }
        next();
    });
};
var isAdminOrThreadOwner = function (req, res) {
    var tid = parseInt(req.params.tid, 10);
    var uid = req.uid;
    var reqApiKey = req.header('X-Api-Key');
    if (reqApiKey) {
        return res.status(200).json({ result: reqApiKey === apiKey });
    }
    if (!uid) {
        return res.status(200).json({ result: false, message: "you're not logged in, btw" });
    }
    if (!tid) {
        return res.status(400).json({ error: "must provide topic id" });
    }
    topicDb.isAllowedToEdit(req.uid, tid, function (err, hasAdminPermission) {
        if (err) {
            return res.status(500).json(err);
        }
        userDb.getGroups(req.uid, function (err, groups) {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({
                result: hasAdminPermission,
                groups: groups
            });
        });
    });
};
var returnSuccess = function (req, res) {
    res.status(200).json({});
};
/*
const requireUidSelfOrThreadEditor: RequestHandler = function (req: NodebbRequest, res: Response, next) {
    if (req.uid === req.body.uid) {
        next(); return;
    }

    requireAdminOrThreadOwner(req, res, next);
};
*/
var getApiMethodGenerator = function (router, methodName) {
    return function (path) {
        var cbs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            cbs[_i - 1] = arguments[_i];
        }
        cbs.forEach(function (cb) {
            router[methodName](prefixApiPath(path), cb);
        });
    };
};
function init(params, callback) {
    var routedMethodGenerator = _.partial(getApiMethodGenerator, params.router);
    var get = routedMethodGenerator('get');
    var pos = routedMethodGenerator('post');
    var del = routedMethodGenerator('delete');
    var put = routedMethodGenerator('put');
    var all = routedMethodGenerator('all');
    all('/:tid', requireTopic, restrictCategories);
    all('/:tid/*', requireTopic, restrictCategories);
    pos('/:tid/*', requireLoggedIn, restrictCategories, requireEventInFuture);
    put('/:tid/*', requireLoggedIn, restrictCategories, requireEventInFuture);
    del('/:tid/*', requireLoggedIn, restrictCategories, requireEventInFuture);
    get('/:tid', requireCanSeeAttendance, matchApi.getAll);
    get('/:tid/has-permissions', isAdminOrThreadOwner, returnSuccess);
    pos('/:tid/match', requireAdminOrThreadOwner, matchApi.post);
    all('/:tid/match', methodNotAllowed);
    put('/:tid/match/:matchid', requireAdminOrThreadOwner, matchApi.put);
    get('/:tid/match/:matchid', requireCanSeeAttendance, matchApi.get);
    del('/:tid/match/:matchid', requireAdminOrThreadOwner, matchApi.del);
    all('/:tid/match/:matchid', methodNotAllowed);
    get('/:tid/match/:matchid/slot', requireCanSeeAttendance, slotApi.getAll);
    all('/:tid/match/:matchid/slot', methodNotAllowed);
    put('/:tid/match/:matchid/slot/:slotid/user', requireCanWriteAttendance, userApi.put); // security is being done by the action here!
    del('/:tid/match/:matchid/slot/:slotid/user', requireCanWriteAttendance, userApi.del); // security is being done by the action here!
    get('/:tid/match/:matchid/slot/:slotid/user', requireCanSeeAttendance, userApi.get);
    all('/:tid/match/:matchid/slot/:slotid/user', methodNotAllowed);
    put('/:tid/match/:matchid/slot/:slotid/reservation', requireAdminOrThreadOwner, reservationApi.put);
    del('/:tid/match/:matchid/slot/:slotid/reservation', requireAdminOrThreadOwner, reservationApi.del);
    get('/:tid/match/:matchid/slot/:slotid/reservation', requireCanSeeAttendance, reservationApi.get);
    all('/:tid/match/:matchid/slot/:slotid/reservation', methodNotAllowed);
    callback();
}
exports.init = init;
function setApiKey(newApiKey) {
    apiKey = newApiKey;
}
exports.setApiKey = setApiKey;
function setAllowedCategories(newAllowedCategories) {
    allowedCategories = newAllowedCategories;
}
exports.setAllowedCategories = setAllowedCategories;
