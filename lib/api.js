"use strict";

const _ = require('underscore');

const matchApi = require('./api/match');
const userApi = require('./api/users');
const reservationApi = require('./api/reservations');
const slotApi = require('./api/slot');
const topicDb = require('./db/topics');
const winston = require('winston');

const prefixApiPath = function(path) {
    return '/api/arma3-slotting' + path;
};

let apiKey;
let allowedCategories = [];

const exceptionToErrorResponse = function (e) {
    return {
        message: e.message
    }
};

var topicIsEvent = function (title) {
    return title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})([^0-9a-z])/i);
};

var secondsToEvent = function (title) {
    let dateParts = title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})( [0-9:+ ])?[^0-9a-z]/i);
    if (!dateParts || !dateParts[0]) {
        return -1;
    }

    let eventDate = new Date(dateParts[0]);

    if (!dateParts[1]) {// if no time part was entered, assume next day
        eventDate.setTime(eventDate.getTime() + 86400*1000)
    }

    return (eventDate.getTime() - (new Date().getTime())) / 1000;
};


const requireEventInFuture = function (req, res, next) {
    topicDb.getTitle(req.params.tid, function (err, title) {
        if (err) {
            return res.status(500).json(exceptionToErrorResponse(err));
        }
        if (!title) {
            return res.status(404).json({"message": "topic %d does not exist or doesnt have a title oO".replace("%d", req.params.tid)});
        }
        if (!topicIsEvent(title)) {
            return res.status(404).json({"message": "topic %d is no event".replace("%d", req.params.tid)});
        }
        if (secondsToEvent(title) < 0) {
            return res.status(403).json({"message": "too late. event start of %d is passed".replace("%d", req.params.tid)});
        }

        next();
    })
};


const requireTopic = function (req, res, next) {
    topicDb.exists(req.params.tid, function (err, result) {
        if (err) {
            return res.status(500).json(exceptionToErrorResponse(err));
        }
        if (!result) {
            return res.status(404).json({"message": "topic %d does not exist".replace("%d", req.params.tid)});
        }

        next();
    })
};

const methodNotAllowed = function (req, res, next) {
    res.status(405).json({"message": "Method not allowed"});
};

const restrictCategories = function (req, res, next) {
    if (allowedCategories.length === 0) {
        next(); return;
    }

    topicDb.getCategoryId(req.params.tid, function (err, cid) {
        if (err) {
            return res.status(500).json(exceptionToErrorResponse(err));
        }
        if (allowedCategories.indexOf(cid) === -1) {
            return res.status(404).json({message: "API disabled for this category"});
        }

        next();
    });
};

const requireLoggedIn = function (req, res, next) {
    if (apiKey && (req.header('X-Api-Key') === apiKey)) {
        next(); return;
    }
    if (req.uid) {
        next(); return;
    }
    return res.status(401).json({"message": "plz log in to access this API"});
};

const requireAdminOrThreadOwner = function (req, res, next) {
    const tid = parseInt(req.params.tid, 10);
    const uid = req.uid;

    if (apiKey && (req.header('X-Api-Key') === apiKey)) {
        next(); return;
    }

    if (!tid || !uid) {
        return res.status(400).json({"message": "must be logged in and provide topic id"})
    }

    topicDb.isAllowedToEdit(req.uid, tid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }
        if (!result) {
            winston.error("user " + req.uid + " tried to edit topic " + tid);
            return res.status(403).json({"message": "You're not admin or owner of this topic"})
        }

        next();
    });
};

const isAdminOrThreadOwner = function (req, res, next) {
    const tid = parseInt(req.params.tid, 10);
    const uid = req.uid;
    const reqApiKey = req.header('X-Api-Key');

    if (reqApiKey) {
        return res.status(200).json({result: reqApiKey === apiKey});
    }

    if (!uid) {
        return res.status(200).json({result: false, message: "you're not logged in, btw"});
    }

    if (!tid) {
        return res.status(400).json({error: "must provide topic id"})
    }

    topicDb.isAllowedToEdit(req.uid, tid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(200).json({result: result})
    });
};

const returnSuccess = function (req, res, next) {
    res.status(200).json({});
};

const requireUidSelfOrThreadEditor = function (req, res, next) {
    if (req.uid === req.body.uid) {
        next(); return;
    }

    requireAdminOrThreadOwner(req, res, next);
};

const getApiMethodGenerator = function (router, methodName) {
    return function (path, cbs) {
        Array.prototype.slice.call(arguments, 1).forEach(function (cb) {
            router[methodName](prefixApiPath(path), cb);
        });
    };
};

module.exports = function (params, callback) {
    const routedMethodGenerator = _.partial(getApiMethodGenerator, params.router);
    const get = routedMethodGenerator('get');
    const pos = routedMethodGenerator('post');
    const del = routedMethodGenerator('delete');
    const put = routedMethodGenerator('put');
    const all = routedMethodGenerator('all');

    all('/:tid', requireTopic, restrictCategories);
    all('/:tid/*', requireTopic, restrictCategories);
    pos('/:tid/*', requireLoggedIn, restrictCategories, requireEventInFuture);
    put('/:tid/*', requireLoggedIn, restrictCategories, requireEventInFuture);
    del('/:tid/*', requireLoggedIn, restrictCategories, requireEventInFuture);

    get('/:tid', matchApi.getAll);

    get('/:tid/has-permissions', isAdminOrThreadOwner, returnSuccess);

    pos('/:tid/match', requireAdminOrThreadOwner, matchApi.post);
    all('/:tid/match', methodNotAllowed);

    put('/:tid/match/:matchid', requireAdminOrThreadOwner, matchApi.put);
    get('/:tid/match/:matchid', matchApi.get);
    del('/:tid/match/:matchid', requireAdminOrThreadOwner, matchApi.delete);
    all('/:tid/match/:matchid', methodNotAllowed);

    get('/:tid/match/:matchid/slot', slotApi.getAll);
    all('/:tid/match/:matchid/slot', methodNotAllowed);

    put('/:tid/match/:matchid/slot/:slotid/user', userApi.put); // security is being done by the action here!
    del('/:tid/match/:matchid/slot/:slotid/user', userApi.delete); // security is being done by the action here!
    get('/:tid/match/:matchid/slot/:slotid/user', userApi.get);
    all('/:tid/match/:matchid/slot/:slotid/user', methodNotAllowed);

    put('/:tid/match/:matchid/slot/:slotid/reservation', requireAdminOrThreadOwner, reservationApi.put);
    del('/:tid/match/:matchid/slot/:slotid/reservation', requireAdminOrThreadOwner, reservationApi.delete);
    get('/:tid/match/:matchid/slot/:slotid/reservation', reservationApi.get);
    all('/:tid/match/:matchid/slot/:slotid/reservation', methodNotAllowed);


    callback();
};

module.exports.setApiKey = function (newApiKey) {
    apiKey = newApiKey;
};


module.exports.setAllowedCategories = function (newAllowedCategories) {
    allowedCategories = newAllowedCategories;
};
