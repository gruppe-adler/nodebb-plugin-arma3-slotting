"use strict";

/*global $, app, bootbox */
require([
    'async',
    'underscore',
    'arma3-slotting/getTemplates',
    'arma3-slotting/eventTopicLoadedService',
    'arma3-slotting/expandUnitTree'
], function (
    async,
    _,
    getTemplates,
    eventLoadedService,
    expandUnitTree
) {
    var cache = {
        topicNode: null,
        eventDate: null
    };

    console.log("arma3-slotting plugin js successfully started");

    (function () {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = '/plugins/nodebb-plugin-arma3-slotting/css/styles.css?' + app.cacheBuster;
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
                app.alert({
                    title: 'Ausgeslottet',
                    message: 'Ausgeslottet',
                    location: 'left-bottom',
                    timeout: 2500,
                    type: 'warning',
                    image: ''
                });
                $(window).trigger('action:arma3-slotting.unset', {tid: topicID});
                load();
            } else {
                confirmUnslottingOfOthers($button.attr('data-username'), deleteAction);
            }
        } else {
            actionOnMySlot('PUT', {uid: app.user.uid}, function () {
                app.alert({
                    title: 'Eingeslottet',
                    message: 'und angemeldet.',
                    location: 'left-bottom',
                    timeout: 2500,
                    type: 'success',
                    image: ''
                });
                $(window).trigger('action:arma3-slotting.set', {tid: topicID});
                load();
            });

        }
    });

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
        var $button  = $(this);
        var topicID = $button.parents('[component="topic"]').attr("data-tid");
        var matchID = $button.parents('[component="match"]').attr("data-uuid");
        bootbox.confirm('match ' + matchID + ' wirklich löschen?', function (result) {
            if (result) {
                deleteMatch(topicID, matchID, load);
            }
        });
    });

    $(document).on('dragstart', '[component="topic/arma3-slotting"] .avatar[data-uid]', function (event) {
        var originalEvent = event.originalEvent;
        originalEvent.dataTransfer.setData(
            "application/json",
            JSON.stringify({
                uid: event.target.getAttribute('data-uid'),
                username: event.target.getAttribute('data-username')
            })
        );
    });


    $(document).on('dragover', '.slot .avatar', function (event) {
        event.preventDefault();
    });


    $(document).on('drop', '[component="topic/arma3-slotting"] .slot .slot_button .avatar', function (event) {
        event.preventDefault();
        
        var user = JSON.parse(event.originalEvent.dataTransfer.getData("application/json"));
        if (!user.uid || !user.username) {
            return;
        }

        var $slot = $(this).parents('.slot');
        var slotID = $slot.attr("data-uuid");
        var topicID = $slot.parents('[component="topic"]').attr("data-tid");
        var matchID = $slot.parents('[component="match"]').attr("data-uuid");
        var actionOnMySlot = _.partial(slotAction, slotID, topicID, matchID);

        actionOnMySlot('PUT', {uid: user.uid}, load);
    });

    /*
    $(document).on('click', '#boolean_language_eng', function (event) {
        window.preset_boolean_eng = !(window.preset_boolean_eng);
        console.log("setting languageEng to " + window.preset_boolean_eng.toString());
    });
    */

     $(document).on('click', '.match-template-button', function (event) {
        // console.log('insert preset');

        var templateName = $(this).attr('data-template');
        var headerText = $(this).attr('data-name');
        var skipDialog = $(this).attr('data-skip');
        var dataIncluded = $(this).attr('data-included');
        var dataClear = $(this).attr('data-clear');
        var dataLocalized = $(this).attr('data-localized');
        var templateLang = document.getElementById("boolean_language_eng").checked ?  'eng/' : 'ger/';

        var form = $('<form id="modal-presets" action="">\
            <h2>' + headerText + ' einfügen</h2><br/>\
            <small>Alle Felder optional. Rufname wird ggf. mit Dummy befüllt.</small><br/>\
    <input type="text" placeholder="Rufname" name="callsign" /><br/>\
    <input type="text" placeholder="Frequenz" name="frequency"/><br/>\
    <input type="text" placeholder="Ingame-Lobby-Bezeichner" name="ingamelobby"/><br>\
    </form>');

        /* dont show dialog for single slots */
        if (!skipDialog) {

            bootbox.alert(form, function(){
                var customAttributes = {
                    callsign: form.find('input[name=callsign]').val(),
                    frequency: form.find('input[name=frequency]').val(),
                    ingamelobby: form.find('input[name=ingamelobby]').val(),
                };

                if (!customAttributes.callsign) {customAttributes.callsign = 'Rufname Platzhalter';}

                function addcustomAttributesToDoc(doc) {
                    Object.keys(customAttributes).forEach(function (attributeName) {
                        if (customAttributes[attributeName]) {
                            doc.firstElementChild.setAttribute(attributeName, customAttributes[attributeName]);
                        }
                    });
                }

                if (dataLocalized) {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateLang + templateName + '.xml?' + app.cacheBuster, function (doc) {
                        addcustomAttributesToDoc(doc);
                        insertTextAtCursorPosition('\n' + doc.firstElementChild.outerHTML, document.getElementById('match-definition'));
                    });

                } else {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateName + '.xml?' + app.cacheBuster, function (doc) {
                        addcustomAttributesToDoc(doc);
                        insertTextAtCursorPosition('\n' + doc.firstElementChild.outerHTML, document.getElementById('match-definition'));
                    });
                }
            });
        } else {
            if (dataIncluded) {
                insertTextAtCursorPosition(dataIncluded, document.getElementById('match-definition'));
            } else {
                if (dataClear) {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateName + '.xml').done(function (xmlDocument) {
                        insertTextAtCursorPosition('\n' + xmlDocument.firstElementChild.outerHTML, document.getElementById('match-definition'));
                    });
                } else {
                    $.get('/plugins/nodebb-plugin-arma3-slotting/presets/' + templateLang + templateName + '.xml', function (xmlDocument) {
                        insertTextAtCursorPosition('\n' + xmlDocument.firstElementChild.outerHTML, document.getElementById('match-definition'));
                    });  
                }
            }
        }
    });

    var slotAction = function (slotID, tid, matchID, method, data, successCallback) {
        $.ajax({
            method: method,
            url: config.relative_path + '/api/arma3-slotting/' + tid + '/match/' + matchID + '/slot/' + slotID + '/user',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : undefined,
            success: successCallback,
            error: function (xhr) {
                var errorMessage = 'Fehler :(';
                if (xhr && xhr.responseJSON) {
                    errorMessage = xhr.responseJSON.message;
                    app.alert({
                        title: [xhr.status, xhr.statusText].join(': '),
                        message: errorMessage,
                        location: 'left-bottom',
                        timeout: 4000,
                        type: 'danger',
                        image: ''
                    });
                }
                console.error(arguments);
            }
        });
    };

    var createMatch = function (spec, tid, successCallback) {
        if (spec.indexOf('<match') !== 0) {
            spec = window.matchString1 + spec + window.matchString2;
        }
        $.ajax({
            method: 'POST',
            url: config.relative_path + '/api/arma3-slotting/' + tid + '/match',
            headers: {
                Accept: "application/json; charset=utf-8",
                'Content-Type': 'application/xml',
            },
            data: spec,
            success: successCallback,
            error: function (request) {
                var message = (request.responseJSON && request.responseJSON.error && request.responseJSON.error.message) || request.statusText;
                bootbox.alert('<div>Statuscode: ' + request.status + '</div><div><blockquote>' + message + '</blockquote></div>');
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
        if (spec.indexOf('<match') !== 0) {
            spec = window.matchString1 + spec + window.matchString2;
        }
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

    var hasPermissions = function (topicId, next) {
        $.get(config.relative_path + '/api/arma3-slotting/' + topicId + '/has-permissions', function (response) {
            window.app.groupNames = response.groups || [];
            next(null, response.result);
        }, 'json');
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

   
    function insertTextAtCursorPosition(text, inputField) {
      var input = inputField;
      // console.log(input);
      if (input == undefined) { return; }
      var scrollPos = input.scrollTop;
      var pos = 0;
      var browser = ((input.selectionStart || input.selectionStart == "0") ? 
        "ff" : (document.selection ? "ie" : false ) );
      if (browser == "ie") { 
        input.focus();
        var range = document.selection.createRange();
        range.moveStart ("character", -input.value.length);
        pos = range.text.length;
      }
      else if (browser == "ff") { pos = input.selectionStart };

      var front = (input.value).substring(0, pos);  
      var back = (input.value).substring(pos, input.value.length); 
      input.value = front+text+back;
      pos = pos + text.length;
      if (browser == "ie") { 
        input.focus();
        var range = document.selection.createRange();
        range.moveStart ("character", -input.value.length);
        range.moveStart ("character", pos);
        range.moveEnd ("character", 0);
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

    function checkDateLock(d) {
        var now = (new Date());

        var fillDate = new Date(d);
        fillDate.setHours(20);
        fillDate.setMinutes(0);

        var itsHistory = (now.getTime() > fillDate.getTime());
        console.log("now is: " + now + " - fillDate is: " + fillDate);

        return itsHistory;
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

        /*
        var content = topicContentNode.querySelector('[component="post/content"]');
        var existingSlottingComponentNode = content.querySelector('[component="topic/slotting"]');
        if (existingSlottingComponentNode) {
            content.replaceChild(slottingNode, existingSlottingComponentNode);
        } else if (content.children.length === 1) {
            content.appendChild(slottingNode);
        }
        */
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
                }),
                hasPermissions: _.partial(hasPermissions, topicId)
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

                if (results.hasPermissions) {
                    insertAddMatchButton(templates.post_bar({tid: topicId}));
                }


                var matchesFragment = document.createElement('div');
                matchesFragment.setAttribute('component', 'topic/arma3-slotting');

                matchesFragment.innerHTML = matches.map(function (match) {
                    match.tid = topicId;
                    match.hasPermissions = results.hasPermissions;
                    return templates.master(expandUnitTree(match));
                }).join('\n<!-- match separation -->\n');

                insertSlotlistsNode(matchesFragment);
            }
        );
    }

    var topicLoaded = function (event, topicNode /*: Node*/, eventDate /*: Date*/) {
        cache.topicNode = topicNode;
        cache.eventDate = eventDate;

        load();
    };

    eventLoadedService.subscribe(topicLoaded);
    $(window).bind('action:attendance.set', function () {
        if (cache.topicNode) {
            setTimeout(load, 50);
        }
    });
});
