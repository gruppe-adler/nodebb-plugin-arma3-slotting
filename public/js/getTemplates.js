define("arma3-slotting/getTemplates",
    ["async", "underscore"],
    function(async, _) {
        var CACHEBUSTER = '5';
        var getTemplates = function (templatePaths /*array of or object with paths relative to public/templates*/, callback) {
            async.parallel(
                _.each(templatePaths, function (templatePath, index, list) {
                    list[index] = function (next) {
                        getTemplate(templatePath + '?' + CACHEBUSTER, next);
                    };
                }),
                callback
            );
        };

        var getTemplate = (function () {
            var loadedTemplates = {};
            return function (templateName, cb) {
                templateName = '/plugins/nodebb-plugin-arma3-slotting/templates/' + templateName;
                if (loadedTemplates[templateName]) {
                    return cb(null, loadedTemplates[templateName]);
                }
                $.get(templateName, function (response) {
                    loadedTemplates[templateName] = response;
                    cb(null, loadedTemplates[templateName]);
                });
            }
        }());

        getTemplates.setCacheBuster = function (x) {
            CACHEBUSTER = x;
        };

        return getTemplates;
    }
);
