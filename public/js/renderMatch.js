/*global define, bootbox, $, app*/
"use strict";

define("arma3-slotting/renderMatch",
    [
        'async',
        'underscore',
        'arma3-slotting/getMatch',
        'arma3-slotting/getMatchPermissions',
        'arma3-slotting/getMatchTemplates',
        'arma3-slotting/eventTopicLoadedService',
        'arma3-slotting/expandUnitTree'
    ],
    function (async,
              _,
              getMatch,
              getMatchPermissions,
              getMatchTemplates,
              eventLoadedService,
              expandUnitTree) {

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

        function addClickHandlers(match, tid, targetNode, permissions) {

            function doLoad() {
                getMatch(tid, match.uuid, function (err, match) {
                    match.tid = tid;
                    match.hasPermissions = permissions;
                    expandUnitTree(match);

                    draw(match, targetNode);
                });
            }

            var slotAction = function (slotID, method, data, successCallback) {
                $.ajax({
                    method: method,
                    url: config.relative_path + '/api/arma3-slotting/' + tid + '/match/' + match.uuid + '/slot/' + slotID + '/user',
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

            $(targetNode).on('dragstart', '.avatar[data-uid]', function (event) {
                var originalEvent = event.originalEvent;
                originalEvent.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                        uid: event.target.getAttribute('data-uid'),
                        username: event.target.getAttribute('data-username')
                    })
                );
            });


            $(targetNode).on('dragover', '.slot .avatar', function (event) {
                event.preventDefault();
            });

            $(targetNode).on('drop', '.slot .slot_button .avatar', function (event) {
                event.preventDefault();

                var user = JSON.parse(event.originalEvent.dataTransfer.getData("application/json"));
                if (!user.uid || !user.username) {
                    return;
                }

                var $slot = $(this).parents('.slot');
                var slotID = $slot.attr("data-uuid");
                slotAction(slotID, 'PUT', {uid: user.uid}, doLoad);
            });


            $(targetNode).on('click', '.slot_button', function (event) {
                var $button = $(this);
                var uid = Number($button.attr('data-uid'));
                var slotID = $button.parent().attr("data-uuid");
                var topicID = tid;
                if (uid) {
                    // $button.attr('data-uid', false); probably not necessary if we reload the whole freaking thing anyway
                    if (uid === app.user.uid) {
                        slotAction(slotID, 'DELETE', null, doLoad);
                        app.alert({
                            title: 'Ausgeslottet',
                            message: 'und abgemeldet.',
                            location: 'left-bottom',
                            timeout: 2500,
                            type: 'warning',
                            image: ''
                        });
                        $(window).trigger('arma3-slotting:unslotted', {tid: topicID});
                        doLoad();
                    } else {
                        confirmUnslottingOfOthers($button.attr('data-username'), function () {
                            slotAction(slotID, 'DELETE', null, doLoad);
                        });
                    }
                } else {
                    slotAction(slotID, 'PUT', {uid: app.user.uid}, function () {
                        app.alert({
                            title: 'Eingeslottet',
                            message: 'und angemeldet.',
                            location: 'left-bottom',
                            timeout: 2500,
                            type: 'success',
                            image: ''
                        });
                        $(window).trigger('arma3-slotting:slotted', {tid: topicID});
                        doLoad();
                    });
                }
            });
        }

        function draw(expandedMatch, targetNode) {
            getMatchTemplates(function (err, compiledTemplates) {
                if (err) {
                    throw err;
                }

                targetNode.innerHTML = compiledTemplates.master(expandedMatch);
            });
        }

        function load(match, tid, targetNode) {
            getMatchPermissions(tid, function (err, permissions) {
                match.tid = tid;
                match.hasPermissions = permissions;
                expandUnitTree(match);

                draw(match, targetNode);
                addClickHandlers(match, tid, targetNode, permissions);
            });
        }

        return load;
    }
);
