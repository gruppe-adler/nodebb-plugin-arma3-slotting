"use strict";

/*global $, app, bootbox */
require([
    'async',
    'underscore',
    'arma3-slotting/expandUnitTree',
    'arma3-slotting/getTemplates',
    'arma3-slotting/getMatchTemplates',
    'arma3-slotting/getMatchPermissions',
    'arma3-slotting/eventTopicLoadedService'
], function (async,
             _,
             expandUnitTree,
             getTemplates,
             getMatchTemplates,
             getMatchPermissions,
             eventLoadedService
) {
    var CACHEBUSTER = '5';

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

    $(document).on('click', '#match-edit-submit', function (event) {
        event.preventDefault();
        var form = document.getElementById('match-definition-form');

        // console.log(form);
        var val = $('#match-definition').val();
        var matchid = form.getAttribute('data-matchid');
        var tid = form.getAttribute('data-tid');

        putMatch(val, tid, matchid, function () {
            document.location.pathname = '/topic/' + tid;
        });
    });

    $(document).on('click', '#match-add-submit', function (event) {
        event.preventDefault();
        var form = document.getElementById('match-definition-form');
        var val = $('#match-definition').val();
        var tid = form.getAttribute('data-tid');

        createMatch(val, tid, function () {
            document.location.pathname = '/topic/' + tid;
        });
    });

    $(document).on('click', '[component="topic"] .match-control-delete', function (event) {
        // console.log('match delete');
        var $button = $(this);
        var topicID = $button.parents('[component="topic"]').attr("data-tid");
        var matchID = $button.parents('[component="match"]').attr("data-uuid");
        bootbox.confirm('match ' + matchID + ' wirklich löschen?', function (result) {
            if (result) {
                deleteMatch(topicID, matchID, load);
            }
        });
    });

    $(document).on('click', '.match-template-button', function (event) {
        // console.log('insert preset');

        var templateName = $(this).attr('data-template');
        var headerText = $(this).attr('data-name');
        var skipDialog = $(this).attr('data-skip');
        var dataIncluded = $(this).attr('data-included');
        var dataClear = $(this).attr('data-clear');
        var dataLocalized = $(this).attr('data-localized');
        var templateLang = document.getElementById("boolean_language_eng").checked ? 'eng/' : 'ger/';

        var form = $('<form id="modal-presets" action="">\
            <h2>' + headerText + ' einfügen</h2><br/>\
            <small>Alle Felder optional. Rufname wird ggf. mit Dummy befüllt.</small><br/>\
    <input type="text" placeholder="Rufname" name="callsign" /><br/>\
    <input type="text" placeholder="Frequenz" name="frequency"/><br/>\
    <input type="text" placeholder="Ingame-Lobby-Bezeichner" name="ingamelobby"/><br>\
    </form>');

        /* dont show dialog for single slots */
        if (!skipDialog) {

            bootbox.alert(form, function () {
                var callsign_input = form.find('input[name=callsign]').val();
                var frequency_input = form.find('input[name=frequency]').val();
                var ingamelobby_input = form.find('input[name=ingamelobby]').val();

                if (!callsign_input) {
                    callsign_input = 'Rufname Platzhalter';
                }

                var callsign = 'callsign="' + callsign_input + '" ';
                var frequency = 'frequency="' + frequency_input + '" ';
                var ingamelobby = 'ingamelobby="' + ingamelobby_input + '" ';

                if (dataLocalized) {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateLang + templateName + '-header.txt?v=' + CACHEBUSTER, function (header) {
                        $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateLang + templateName + '-footer.txt?v=' + CACHEBUSTER, function (footer) {
                            insertTextAtCursorPosition('\n' + header + ' ' + callsign + ' ' + frequency + ' ' + ingamelobby + ' ' + footer, document.getElementById('match-definition'));
                        });

                    });
                } else {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateName + '-header.txt?v=' + CACHEBUSTER, function (header) {
                        $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateName + '-footer.txt?v=' + CACHEBUSTER, function (footer) {
                            insertTextAtCursorPosition('\n' + header + ' ' + callsign + ' ' + frequency + ' ' + ingamelobby + ' ' + footer, document.getElementById('match-definition'));
                        });
                    });
                }
            });
        } else {
            if (dataIncluded) {
                insertTextAtCursorPosition(dataIncluded, document.getElementById('match-definition'));
            } else {
                if (dataClear) {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateName + '.txt', function (template) {
                        insertTextAtCursorPosition('\n' + template, document.getElementById('match-definition'));
                    });
                } else {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateLang + templateName + '.txt', function (template) {
                        insertTextAtCursorPosition('\n' + template, document.getElementById('match-definition'));
                    });
                }
            }
        }
    });

    var createMatch = function (spec, tid, successCallback) {
        $.ajax({
            method: 'POST',
            url: config.relative_path + '/api/arma3-slotting/' + tid + '/match',
            headers: {
                Accept: "application/json; charset=utf-8",
                'Content-Type': 'application/xml',
            },
            data: window.matchString1 + spec + window.matchString2,
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
            data: window.matchString1 + spec + window.matchString2,
            success: successCallback,
            error: function () {
                bootbox.alert('das ging schief :(');
            }
        });
    };



    var refreshToolTips = function () {
        var attendanceAvatar = document.querySelectorAll(".avatar, .slot_descr, .container_title, .natosymbol, .customTooltip");

        _.each(attendanceAvatar, function (attendanceAvatar) {
            if (!utils.isTouchDevice()) {
                $(attendanceAvatar).tooltip({
                    placement: 'top',
                    title: $(attendanceAvatar).attr('title')
                });
            }
        });
    };

    function insertTextAtCursorPosition(text, inputField) {
        var input = inputField;
        // console.log(input);
        if (input == undefined) {
            return;
        }
        var scrollPos = input.scrollTop;
        var pos = 0;
        var browser = ((input.selectionStart || input.selectionStart == "0") ?
            "ff" : (document.selection ? "ie" : false ) );
        if (browser == "ie") {
            input.focus();
            var range = document.selection.createRange();
            range.moveStart("character", -input.value.length);
            pos = range.text.length;
        }
        else if (browser == "ff") {
            pos = input.selectionStart
        }
        ;

        var front = (input.value).substring(0, pos);
        var back = (input.value).substring(pos, input.value.length);
        input.value = front + text + back;
        pos = pos + text.length;
        if (browser == "ie") {
            input.focus();
            var range = document.selection.createRange();
            range.moveStart("character", -input.value.length);
            range.moveStart("character", pos);
            range.moveEnd("character", 0);
            range.select();
        }
        else if (browser == "ff") {
            input.selectionStart = pos;
            input.selectionEnd = pos;
            input.focus();
        }
        input.scrollTop = scrollPos;
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
        // console.log("slotting-insertslottinbutton called");
        var postBarNodes = document.querySelectorAll(".post-bar");

        _.each(postBarNodes, function (postBarNode) {
            var mainButtonsNode = postBarNode.querySelector('.topic-main-buttons');
            // console.log("slotting-insertslottinbutton array");

            var node = document.createElement('div');
            node.innerHTML = markup;

            mainButtonsNode.parentNode.insertBefore(node.firstElementChild, mainButtonsNode);

        });
    }

    var insertSlotlistsNode = function (slottingNode) {
        var topicContentNode = cache.topicNode;

        var firstPostCheck = topicContentNode.querySelector('[component="post"]');

        if (firstPostCheck.getAttribute("data-index") !== "0") {
            return false; //exit if isn't first page
        }

        var postBarNode = firstPostCheck.querySelector('[class="post-bar"]');
        var attendanceNode = firstPostCheck.querySelector('[component="topic/attendance');

        //only insert if the postbar exists (if this is the first post)
        if (postBarNode) {
            postBarNode.parentNode.insertBefore(slottingNode, attendanceNode || postBarNode);
        } else if (topicContentNode.children.length === 1) {
            firstPostCheck.appendChild(slottingNode);
        }

        refreshToolTips();
    };

    function load() {

        var topicId = parseInt(cache.topicNode.getAttribute('data-tid'), 10);
        async.parallel(
            {
                matches: _.partial(getMatches, topicId),
                templates: getMatchTemplates,
                hasPermissions: _.partial(getMatchPermissions, topicId)
            },
            function (err, results) {
                var matches = results.matches;

                matches.forEach(function (match) {
                    expandUnitTree(match);
                    match.tid = topicId;
                });

                _.each(cache.topicNode.querySelectorAll('[component="topic/arma3-slotting"]'), function (node) {
                    node.parentNode.removeChild(node);
                });
                _.each(document.querySelectorAll('[component="topic/slottingButton"]'), function (node) {
                    node.parentNode.removeChild(node);
                });

                if (results.hasPermissions) {
                    insertAddMatchButton(results.templates.post_bar({tid: topicId}));
                }

                var matchesFragment = document.createElement('div');
                matchesFragment.setAttribute('component', 'topic/arma3-slotting');

                matches.forEach(function (match) {
                    var matchNode = document.createElement('div');
                    matchNode.innerHTML = results.templates.overview(getMatchWithUsers(match));
                    matchesFragment.appendChild(matchNode);
                });

                insertSlotlistsNode(matchesFragment);
            }
        );
    }

    var getMatchWithUsers = function (match) {
        match.users = matchToUsers(match);

        return match;
    };

    var matchToUsers = function (match) {
        var users = [];
        ['company', 'platoon', 'squad', 'fireteam', 'slot'].forEach(function (subUnitName) {
            if (match[subUnitName]) {
                match[subUnitName].forEach(function(subUnit) {
                    users = users.concat(matchToUsers(subUnit));
                })
            }
        });
        if (match.user) {
            users.push(match.user);
        }
        return users;
    };

    var topicLoaded = function (event, topicNode /*: Node*/, eventDate /*: Date*/) {
        cache.topicNode = topicNode;
        cache.eventDate = eventDate;

        load();
    };

    eventLoadedService.subscribe(topicLoaded);
});
