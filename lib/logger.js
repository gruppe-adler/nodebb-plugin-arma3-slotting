const winston = require('../../winston/lib/winston');
const id = 'plugin/arma3-slotting';

function format(message) {
    return '[%s] %s'.replace('%s', id).replace('%s', message);
}

makeLogFunction = function (level) {
    return function (message) {
        arguments[0] = format(message);
        winston[level].apply(winston, arguments);
    };
};

module.exports.debug = makeLogFunction('debug');
module.exports.info = makeLogFunction('info');
module.exports.warn = makeLogFunction('warn');
module.exports.error = makeLogFunction('error');
