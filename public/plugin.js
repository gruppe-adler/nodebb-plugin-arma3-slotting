"use strict";

/*global $, app, bootbox */
require([
    'async',
    'underscore',
    'arma3-slotting/getTemplates',
    'arma3-slotting/eventTopicLoadedService'
], function (
    async,
    _,
    getTemplates,
    eventLoadedService
) {
    var CACHEBUSTER = '3';

    var cache = {
        topicNode: null,
        eventDate: null
    };

    getTemplates.setCacheBuster(CACHEBUSTER);

    console.log("arma3-slotting plugin js successfully started");

    (function () {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = '/plugins/nodebb-plugin-arma3-slotting/css/styles.css?v=' + CACHEBUSTER;
        document.head.appendChild(css);
    }());

    $(document).on('click', '[component="topic"] .slot_button', function (event) {
        var $button = $(this);
        var uid = Number($button.attr('data-uid'));
        var slotID = $button.parent().attr("data-uuid");
        var topicID = $button.parents('[component="topic"]').attr("data-tid");
        var matchID = $button.parents('[component="match"]').attr("data-uuid");
        var actionOnMySlot = _.partial(slotAction, slotID, topicID, matchID);

        if (uid) {
            var deleteAction = _.partial(actionOnMySlot, 'DELETE', null, load);
            // $button.attr('data-uid', false); probably not necessary if we reload the whole freaking thing anyway
            if (uid === app.user.uid) {
                deleteAction();
            } else {
                confirmUnslottingOfOthers($button.attr('data-username'), deleteAction);
            }
        } else {
            actionOnMySlot('PUT', {uid: app.user.uid}, load);
        }
    });
/*
    $(document).on('click', '[component="topic"] .match-control-edit', function (event) {
        console.log('match edit');
        var $button = $(this);
        var topicID = $button.parents('[component="topic"]').attr("data-tid");
        var matchID = $button.parents('[component="match"]').attr("data-uuid");
        getMatchAsXml(topicID, matchID, function (matchXml) {
            bootbox.prompt({
                inputType: 'textarea',
                value: matchXml,
                size: 'large',
                title: 'Please change the match specification',
                callback: function (inputString) {
                    if (inputString) {
                        putMatch(inputString, topicID, matchID, load);
                    }
                }
            });
        });
    });
*/
    $(document).on('click', '#match-submit', function (event) {
        event.preventDefault();
        var form = $(this).parents('form');
        var val = $('#match-definition').val();
        var matchid = form.attr('data-matchid');
        var tid = form.attr('data-tid');

        putMatch(val, tid, matchid, function () {
            document.location.pathname = '/topic/' + tid;
        });
    });


    $(document).on('click', '.arma3-slotting-button-add-match', function () {
        var topicID = $(cache.topicNode).attr("data-tid");
        bootbox.prompt({
            inputType: 'textarea',
            size: 'large',
            title: 'Please enter the match specification',
            callback: function (inputString) {
                if (inputString) {
                    createMatch(inputString, topicID, load);
                }
            }
        });
    });

    $(document).on('click', '[component="topic"] .match-control-delete', function (event) {
        console.log('match delete');
        var $button  = $(this);
        var topicID = $button.parents('[component="topic"]').attr("data-tid");
        var matchID = $button.parents('[component="match"]').attr("data-uuid");
        bootbox.confirm('match ' + matchID + ' wirklich löschen?', function (result) {
            if (result) {
                deleteMatch(topicID, matchID, load);
            }
        });
    });

    var slotAction = function (slotID, tid, matchID, method, data, successCallback) {
        $.ajax({
            method: method,
            url: config.relative_path + '/api/arma3-slotting/' + tid + '/match/' + matchID + '/slot/' + slotID + '/user',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : undefined,
            success: successCallback,
            error: function () {
                console.error(arguments);
            }
        });
    };

    var createMatch = function (spec, tid, successCallback) {
        $.ajax({
            method: 'POST',
            url: config.relative_path + '/api/arma3-slotting/' + tid + '/match',
            headers: {
                Accept: "application/json; charset=utf-8",
                'Content-Type': 'application/xml',
            },
            data: spec,
            success: successCallback,
            error: function () {
                bootbox.alert('das ging schief :(');
            }
        });
    };

    var deleteMatch = function (tid, matchUuid, successCallback) {
        $.ajax({
            method: 'DELETE',
            url: config.relative_path + '/api/arma3-slotting/' + tid + '/match/' + matchUuid,
            headers: {
                Accept: "application/json; charset=utf-8"
            },
            success: successCallback,
            error: function () {
                bootbox.alert('das ging schief :(');
            }
        });
    };

    var putMatch = function (spec, tid, matchUuid, successCallback) {
        $.ajax({
            method: 'PUT',
            url: config.relative_path + '/api/arma3-slotting/' + tid + '/match/' + matchUuid,
            headers: {
                Accept: "application/json; charset=utf-8",
                'Content-Type': 'application/xml',
            },
            data: spec,
            success: successCallback,
            error: function () {
                bootbox.alert('das ging schief :(');
            }
        });
    };

    function confirmUnslottingOfOthers(targetUsername, callback) {
        bootbox.confirm({
            message: targetUsername + " vom Slot schmeißen?",
            size: "small",
            buttons: {
                confirm: {
                    label: 'Runterschmeißen',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'Abbrechen',
                    className: 'btn-danger'
                }
            },
            callback: function (isConfirmed) {
                if (isConfirmed) {
                    callback();
                }
            }
        });
    }

    var refreshToolTips = function () {
        var attendanceAvatar = document.querySelectorAll(".avatar, .slot_descr, .container_title, .natosymbol");

        _.each(attendanceAvatar, function (attendanceAvatar) {
            if (!utils.isTouchDevice()) {
                $(attendanceAvatar).tooltip({
                    placement: 'top',
                    title: $(attendanceAvatar).attr('title')
                });
            }
        });
    };

    function getMatchAsXml(topicId, matchUuid, cb) {
        $.ajax({
            method: 'GET',
            url: '/api/arma3-slotting/' + topicId + '/match/' + matchUuid,
            headers: {
                Accept: 'application/xml',
                'Content-Type': 'application/xml'
            },
            dataType: "text", // else jquery will parse xml response and return an xml dom object
            success: cb,
            error: function () {
                alert('nooo this should not happen');
                console.warn(arguments);
            }
        });
    }

    // mapping for font MapSym-FR-Land
    function getNATOSymbol(symbolString) {
        var natoSymbol = "";
        switch (symbolString) {
            case "inf": natoSymbol = "+";
            break;
            case "motor_inf": natoSymbol = "®";
            break;
            case "mech_inf": natoSymbol = "®";
            break;
            case "armor": natoSymbol = "A";
            break;
            case "recon": natoSymbol = "Û";
            break;
            case "air": natoSymbol = "p";
            break;
            case "plane": natoSymbol = "w";
            break;
            case "uav": natoSymbol = "g";
            break;
            case "med": natoSymbol = "Â";
            break;
            case "art": natoSymbol = "#";
            break;
            case "mortar": natoSymbol = "Ó";
            break;
            case "hq": natoSymbol = "¬0";
            break;
            case "support": natoSymbol = "B";
            break;
            case "maint": natoSymbol = "<";
            break;
            case "service": natoSymbol = "";
            break;
            default: natoSymbol = "";
        }
        return natoSymbol;
    }


    // cb = callback
    function getMatches(topicId, cb) {
        $.get('/api/arma3-slotting/' + topicId + '?withusers=1', function (response) {
            if (typeof response === 'string') {
                response = JSON.parse(response)
            }

            cb(null, response);
        });
    }

   


    function insertAddMatchButton(markup) {
        console.log("slotting-insertslottinbutton called");
        var postBarNode = document.querySelectorAll(".post-bar .clearfix");

        _.each(postBarNode, function (postBarNode) {
            console.log("slotting-insertslottinbutton array");

            var node = document.createElement('div');
            node.innerHTML = markup;

            postBarNode.insertBefore(node.firstElementChild, postBarNode.querySelector('.topic-main-buttons'));

        });
    }

    function checkDateLock(d) {
        var now = (new Date());

        var fillDate = new Date(d);
        fillDate.setHours(20);
        fillDate.setMinutes(0);

        var itsHistory = (now.getTime() > fillDate.getTime());
        console.log("now is: " + now + " - fillDate is: " + fillDate);

        return itsHistory;
    }

    var insertMatchNode = function (slottingNode) {
        var topicContentNode = cache.topicNode;

        var firstPostCheck = topicContentNode.querySelector('[component="post"]');

        if (firstPostCheck.getAttribute("data-index") !== "0") {
            return false; //exit if isn't first page
        }

        var postBarNode = firstPostCheck.querySelector('[class="post-bar"]');

        //only insert attendance if the postbar exists (if this is the first post)
        if (postBarNode) {
            postBarNode.parentNode.insertBefore(slottingNode, postBarNode);
        } else if (topicContentNode.children.length === 1) {
            firstPostCheck.appendChild(slottingNode);
        }

        var content = topicContentNode.querySelector('[component="post/content"]');
        var existingSlottingComponentNode = content.querySelector('[component="topic/slotting"]');
        if (existingSlottingComponentNode) {
            content.replaceChild(slottingNode, existingSlottingComponentNode);
        } else if (content.children.length === 1) {
            content.appendChild(slottingNode);
        }
        refreshToolTips();
    };

    function load() {

        var topicId = parseInt(cache.topicNode.getAttribute('data-tid'), 10);
        async.parallel(
            {
                matches: _.partial(getMatches, topicId),
                templates: _.partial(getTemplates, {
                    master: 'tile_master.ejs',
                    slave: 'tile_slave.ejs',
                    company: 'company.ejs',
                    platoon: 'platoon.ejs',
                    squad: 'squad.ejs',
                    fireteam: 'fireteam.ejs',
                    slot: 'slot.ejs',
                    post_bar: 'post_bar.ejs'
                })
            },
            function (err, results) {
                var matches = results.matches;
                var templates = results.templates;
                window.pluginArma3SlottingTemplates = _.each(templates, function (templateString, index, obj) {
                    obj[index] = _.template(templateString, {variable: 'x'});
                });

                _.each(cache.topicNode.querySelectorAll('[component="topic/arma3-slotting"]'), function (node) {
                    node.parentNode.removeChild(node);
                });
                _.each(document.querySelectorAll('[component="topic/slottingButton"]'), function (node) {
                    node.parentNode.removeChild(node);
                });

                insertAddMatchButton(templates.post_bar({}));

                matches.forEach(function (match) {
                    match.tid = topicId;
                    var markup = templates.master(match);

                    var node = document.createElement('div');
                    node.setAttribute('component', 'topic/arma3-slotting');
                    node.innerHTML = markup;

                    insertMatchNode(node);
                    console.log("insertTopicSlottingNode...");
                });
            }
        );
    }

    var topicLoaded = function (event, topicNode /*: Node*/, eventDate /*: Date*/) {
        cache.topicNode = topicNode;
        cache.eventDate = eventDate;

        load();
    };

    eventLoadedService.subscribe(topicLoaded);
});
