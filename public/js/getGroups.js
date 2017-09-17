define("arma3-slotting/getGroups",
    [],
    function () {
        var groups;

        return function (cb) {
            var path = '/api/groups';
            if (groups) {
                return cb(null, groups);
            }
            $.get(path, function (response) {
                var groups = response.groups.map(function (group) {
                    return {
                        title: group.userTitle,
                        color: group.labelColor,
                        name: group.name
                    }
                });
                cb(null, groups);
            });
        }
    }
);
