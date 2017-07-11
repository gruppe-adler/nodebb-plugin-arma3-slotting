"use strict";

define("arma3-slotting/getMatchTemplates",
    [
        "underscore",
        "arma3-slotting/getTemplates"
    ],
    function (
        _,
        getTemplates
    ) {
        var compiledTemplates;

        return function (callback) {
            if (compiledTemplates) {
                return callback(null, compiledTemplates);
            }
            getTemplates(
                {
                    master: 'tile_master.ejs',
                    slave: 'tile_slave.ejs',
                    company: 'company.ejs',
                    platoon: 'platoon.ejs',
                    squad: 'squad.ejs',
                    fireteam: 'fireteam.ejs',
                    slot: 'slot.ejs',
                    post_bar: 'post_bar.ejs',
                    overview: 'overview.ejs'
                },
                function (err, rawTemplates) {
                    if (err) {
                        return callback(err);
                    }

                    compiledTemplates = {};
                    _.each(rawTemplates, function (templateString, index) {
                        compiledTemplates[index] = _.template(templateString, {variable: 'x'});
                    });

                    window.pluginArma3SlottingTemplates = compiledTemplates; // TODO FIX EVIL

                    callback(null, compiledTemplates);
                }
            );
        }
    }
);
