"use strict";

/*global $, app, bootbox, JSON, window, console, config */
require([
    'arma3-slotting/eventTopicLoadedService',
    'arma3-slotting/getPluginConfig'
], function (
    eventLoadedService,
    getPluginConfig
) {
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


    function getSlotlistIsExpanded() {
        const isInitialVisible = localStorage.getItem('slotlist-external-visible') || 'false'
        return JSON.parse(isInitialVisible);
    }
    function setSlotlistIsExpanded(value) {
        localStorage.setItem('slotlist-external-visible', JSON.stringify(value));
    }

    function bindToggleButton() {
        function show() {
            setSlotlistIsExpanded(true);
            $('[component="topic/arma3-slotting"]').addClass('expanded').removeClass('collapsed');
            $('#topic-arma3-slotting-expand').hide();
            $('#topic-arma3-slotting-collapse').show();
        }
        function hide() {
            setSlotlistIsExpanded(false);
            $('[component="topic/arma3-slotting"]').addClass('collapsed').removeClass('expanded');
            $('#topic-arma3-slotting-collapse').hide();
            $('#topic-arma3-slotting-expand').show();
        }

        getSlotlistIsExpanded() ? show() : hide();
        load();

        $('#topic-arma3-slotting-collapse').click(() => {
            hide();
        });
        $('#topic-arma3-slotting-expand').click(() => {
            show();
        });
        $('#topic-arma3-slotting-close').click(() => {
            $('[component="topic/arma3-slotting"]').addClass('hidden').removeClass('expanded').removeClass('collapsed');
        });
    }

    (function () {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = '/assets/plugins/nodebb-plugin-arma3-slotting/css/styles.css?' + app.cacheBuster;
        document.head.appendChild(css);
    }());

    const refreshToolTips = function () {
        const attendanceAvatar = document.querySelectorAll(".avatar, .slot_descr, .container_title, .natosymbol, .customTooltip");

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
        const matchesIframe = document.querySelector('#slotlist-external');
        if (matchesIframe) {
            matchesIframe.src = matchesIframe.src;
            return;
        }
        const matchesIframeFragment = document.createElement('section');
        matchesIframeFragment.setAttribute('component', 'topic/arma3-slotting');
        getPluginConfig(function (err, config) {
            if (document.querySelector('#slotlist-external')) {
                return;
            }
            matchesIframeFragment.innerHTML = `
                <div class="arma3-slotting-header">
                    <h3>slotting</h3>
                    <div>
                        <a
                            class="nodebb btn btn-sm"
                            href="${config.slottingUiUrl}/slotting?tid=${topicId}"
                            target="_blank"
                            title="open in new tab"
                        >
                            <i class="fa fa-external-link"></i>
                        </a>
                        <button id="topic-arma3-slotting-collapse" class="btn btn-sm" title="collapse">
                            <i class="far fa-window-minimize"></i>
                        </button>
                        <button id="topic-arma3-slotting-expand" class="btn btn-sm" title="expand">
                            <i class="fa fa-window-maximize"></i>
                        </button>
                        <button id="topic-arma3-slotting-close" class="btn btn-sm" title="close">
                            <i class="fa fa-close"></i>
                        </button>
                    </div>
                </div>
                <iframe id="slotlist-external" src="${config.slottingUiUrl}/slotting?tid=${topicId}" ></iframe>`;
            insertSlotlistsNode(matchesIframeFragment);
            bindToggleButton();
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
