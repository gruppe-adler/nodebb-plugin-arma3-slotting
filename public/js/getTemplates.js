define("arma3-slotting/getTemplates",
    ["async", "underscore"],
    function(async, _) {
        var CACHEBUSTER = '4';
        var getTemplates = function (templatePaths /*array of or object with paths relative to public/templates*/, callback) {
            async.parallel(
                _.each(templatePaths, function (templatePath, index, list) {
                    list[index] = function (next) {
                        getTemplate(templatePath + '?' + CACHEBUSTER, function (template) {
                            next(null, template);
                        });
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
                    return cb(loadedTemplates[templateName]);
                }
                $.get(templateName, function (response) {
                    loadedTemplates[templateName] = response;
                    cb(loadedTemplates[templateName]);
                });
            }
        }());

        getTemplates.setCacheBuster = function (x) {
            CACHEBUSTER = x;
        };

        return getTemplates;
    }
);
