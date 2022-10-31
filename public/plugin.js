"use strict";

/*global $, app, bootbox, JSON, window, console, config */
require([
    'iframe-resize',
    'arma3-slotting/eventTopicLoadedService',
    'arma3-slotting/getPluginConfig'
], function (
    iframeResize,
    eventLoadedService,
    getPluginConfig
) {
    window.iFrameResize = iframeResize;
    var cache = {
        topicNode: null,
        eventDate: null
    };
    console.log("arma3-slotting plugin js successfully started");

    window.addEventListener('message', function(e) {
        if (!e.data || !e.data.type) {
            return;
        }

        switch (e.data.type) {
            case 'alert': {
                app.alert(e.data.data);
            } break;

            case 'bootboxAlert': {
                bootbox.alert(e.data.data);
            } break;

            case 'bootboxConfirm': {
                bootbox.confirm(e.data.data, function (result) {
                    document.getElementById('slotlist-external').contentWindow.postMessage(
                    {
                        type: 'bootboxConfirmResult',
                        data: result
                    }, '*');
                });
            } break;

            case 'windowScrollBy': {
                window.scrollBy(e.data.data.x, e.data.data.y);
            } break;
        }
    });

    (function () {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = '/plugins/nodebb-plugin-arma3-slotting/css/styles.css?' + app.cacheBuster;
        document.head.appendChild(css);
    }());

    var refreshToolTips = function () {
        var attendanceAvatar = document.querySelectorAll(".avatar, .slot_descr, .container_title, .natosymbol, .customTooltip");

        attendanceAvatar.forEach( (attendanceAvatar) => {
            if (!utils.isTouchDevice()) {
                $(attendanceAvatar).tooltip({
                    placement: 'top',
                    title: $(attendanceAvatar).attr('title')
                });
            }
        });
    };


    var insertSlotlistsNode = function (slottingNode) {
        const topicNode = document.querySelector('[component="topic"]');
        const attendanceNode = document.querySelector('[component="topic/attendance"]');

        if (attendanceNode) {
            attendanceNode.parentNode.insertBefore(slottingNode, attendanceNode.nextElementSibling);
        } else if (topicNode) {
            topicNode.parentNode.insertBefore(slottingNode, topicNode);
        }

        refreshToolTips();
    };


    function load() {

        const topicId = parseInt(cache.topicNode.getAttribute('data-tid'), 10);
        var matchesIframe = document.querySelector('#slotlist-external');
        if (matchesIframe) {
            matchesIframe.src = matchesIframe.src;
            return;
        }
        var matchesIframeFragment = document.createElement('div');
        matchesIframeFragment.setAttribute('component', 'topic/arma3-slotting');
        getPluginConfig(function (err, config) {
            if (document.querySelector('#slotlist-external')) {
                return;
            }
            matchesIframeFragment.innerHTML = '<iframe ' +
                'id="slotlist-external" ' +
                'style="margin-top: 20px; border: none; min-width: 100%; width: 1px;" ' +
                'scrolling="no" ' +
                'src="' + config.slottingUiUrl + '/slotting?tid=' + topicId + '" ' +
                'onload="iFrameResize()">' +
                '</iframe>';
            insertSlotlistsNode(matchesIframeFragment);
        });
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
