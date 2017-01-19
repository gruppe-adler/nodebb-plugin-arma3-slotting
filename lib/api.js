const _ = require('underscore');

const prefixApiPath = function(path) {
    return '/api/arma3-slotting' + path;
};


const stub = function (req, res, next) {
    const tid = req.params.tid;
    const uid = req.uid;

    return res.status(501).json("not implemented… yet");
};

const getApiMethodGenerator = function (router, methodName) {
    return function (path, cb) {
        router[methodName](prefixApiPath(path), cb);
    };
};


module.exports = function (params, callback) {
    const routedMethodGenerator = _.partial(getApiMethodGenerator, params.router);
    const get = routedMethodGenerator('get');
    const pos = routedMethodGenerator('post');
    const pat = routedMethodGenerator('patch');
    const del = routedMethodGenerator('delete');
    const put = routedMethodGenerator('put');

    get('/:tid', stub);

    pos('/:tid/match', stub);

    put('/:tid/match/:matchid', stub);
    pat('/:tid/match/:matchid', stub);
    get('/:tid/match/:matchid', stub);

    put('/:tid/match/:matchid/slot/:slotid/user', stub);
    del('/:tid/match/:matchid/slot/:slotid/user', stub);

    put('/:tid/match/:matchid/slot/:slotid/reservation', stub);
    del('/:tid/match/:matchid/slot/:slotid/reservation', stub)

};
