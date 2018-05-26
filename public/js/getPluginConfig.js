/**global app */
define('arma3-slotting/getPluginConfig', ['async', 'underscore'], function () {
    var config;
    var callbacks = [];

    $.get('/api/arma3-slotting/config?' + app.cacheBuster, function (response) {
        config = response;
        callbacks.forEach(function (cb) {
            cb(null, config);
        });
        callbacks = [];
    });

    return function (cb) {
        if (config) {
            cb(null, config);
        } else {
            callbacks.push(cb);
        }
    };
});
