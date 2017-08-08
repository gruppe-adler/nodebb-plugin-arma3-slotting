"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("../../winston/lib/winston");
var id = 'plugin/arma3-slotting';
function format(message) {
    return '[%s] %s'.replace('%s', id).replace('%s', message);
}
function makeLogFunction(level) {
    return function (message) {
        arguments[0] = format(message);
        winston[level].apply(winston, arguments);
    };
}
exports.debug = makeLogFunction('debug');
exports.info = makeLogFunction('info');
exports.warn = makeLogFunction('warn');
exports.error = makeLogFunction('error');
