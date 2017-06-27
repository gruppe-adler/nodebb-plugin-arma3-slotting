define("arma3-slotting/getMatchPermissions", [], function () {

    var permissions = {};

    var hasPermissions = function (topicId, cb) {
        $.get(config.relative_path + '/api/arma3-slotting/' + topicId + '/has-permissions', function (response) {
            window.app.groupNames = response.groups || [];
            cb(null, response.result);
        }, 'json');
    };

    return function (tid, callback) {
        if (permissions[tid]) {
            return callback(null, permissions[tid]);
        }
        hasPermissions(tid, function (err, result) {
            if (err) {
                return callback(err);
            }

            permissions[tid] = result;

            callback(null, result);
        });
    }
});
