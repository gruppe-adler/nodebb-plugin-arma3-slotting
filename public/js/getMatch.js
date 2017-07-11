/*global define, $*/
define("arma3-slotting/getMatch", [
    "arma3-slotting/expandUnitTree"
], function (expandUnitTree) {

    var getMatch = function (topicId, matchUuid, cb) {
        $.get('/api/arma3-slotting/' + topicId + '/match/' + matchUuid + '?withusers=1', function (response) {
            if (typeof response === 'string') {
                response = JSON.parse(response)
            }

            expandUnitTree(response);
            response.tid = topicId;

            getMatch.callbacks.forEach(function (callback) {
                try {
                    callback(response);
                } catch (e) {
                    console.error(e);
                }
            });

            cb(null, response);
        });
    };

    getMatch.callbacks = [];

    return getMatch;
});
