"use strict";

module.exports.setup = function (params, callback) {
    require('./lib/api')(params, callback);
};
