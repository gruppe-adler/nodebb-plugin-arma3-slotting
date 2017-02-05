require(['async'], function (async) {

    console.log("arma3-slotting plugin js successfully started");

    (function () {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = '/plugins/nodebb-plugin-arma3-slotting/css/styles.css?v=2';
        document.head.appendChild(css);
    }());

    (function () {
        $(document).on('click', '#slot_button', function (event) {
            var $button = $(this);
            var value = getCurrentButtonValue($button);
            // console.log(value);

            if (value == 'empty') {
                value = 'taken';
                $button.data("value", "taken");
                // console.log("yes to yes");
            } else {
                value = 'empty';
                $button.data("value", "empty");
                // console.log("any to unknown");
            }
            setCurrentButtonValue($(this)[0], value);
            // userConfirmAction();
        });
    }());

    function getCurrentButtonValue(button) {
        return button.attr('data-value');
    }

    function setCurrentButtonValue(button, value) {
        console.log("setting to " + value);
        return button.setAttribute('data-value', value);
    }

    function userConfirmAction() {
            bootbox.confirm({
                message: "XiviD vom Slot schmeißen?",
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
                callback: function (result) {
                    console.log('This was logged in the callback: ' + result);
                }
            });
    };

    var isMission = function (title) {
        return title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})([^0-9a-z])/i);
    };

    function getTopicTitle(categoryTopicComponentNode) {
        var titleElement = categoryTopicComponentNode.querySelector('[component="topic/header"] a, [component="topic/title"]');
        return titleElement.getAttribute('content') || titleElement.textContent || '';
    }

    var cachebuster = '3';
    var getTemplates = function (templatePaths /*array of paths relative to public/templates*/, callback) {
        async.parallel(
            templatePaths.map(function (templatePath) {
                return function (next) {
                    getTemplate(templatePath + '?' + cachebuster, function (template) {
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

    var refreshToolTips = function () {
        var attendanceAvatar = document.querySelectorAll(".avatar");
        
        Array.prototype.forEach.call(attendanceAvatar, function (attendanceAvatar) {
            if (!utils.isTouchDevice()) {
                $(attendanceAvatar).tooltip({
                    placement: 'top',
                    title: $(attendanceAvatar).attr('title')
                });
            }
        });

        var slotDescriptions = document.querySelectorAll(".slot_descr");
        Array.prototype.forEach.call(slotDescriptions, function (slotDescriptions) {
            if (!utils.isTouchDevice()) {
                $(slotDescriptions).tooltip({
                    placement: 'top',
                    title: $(slotDescriptions).attr('title')
                });
            }
        });
    };

   

   

    // cb = callback
    function getMatches(topicId, cb) {
        $.get('/api/arma3-slotting/' + topicId, function (response) {
            if (typeof response == 'string') {
                response = JSON.parse(response)
            }

            cb(null, response);
        });
    }

    // github original
    function insertSlottingButton(topicNode) {
        console.log("slotting-insertslottinbutton called");
        var postBarNode = document.querySelectorAll(".post-bar .clearfix");
        var topicId = parseInt(topicNode.getAttribute('data-tid'), 10);

        Array.prototype.forEach.call(postBarNode, function (postBarNode) {
            console.log("slotting-insertslottinbutton array");

            getTemplates('post_bar.ejs', function (err, templates) {
                console.log("slotting-insertslottinbutton gettemplates");
                var buttonsNode = document.createElement('div');
                var existingButtonsNode = postBarNode.querySelector('[data-id="master"]');
                var templateString = templates[0];

                var topicDateString = isMission(getTopicTitle(document))[1];
                console.log("slotting-topicDateString: " + topicDateString);
                var isLocked = checkDateLock(topicDateString);
                console.log("slotting-isLocked: " + isLocked);

                var markup = _.template(templateString)({
                    config: {
                        relative_path: config.relative_path
                    },
                    isLockedMarkup: isLocked,
                    tid: topicId
                });
                buttonsNode.innerHTML = markup;

                if (!existingButtonsNode) {
                    console.log('adding slottingButtonNode');
                    postBarNode.appendChild(buttonsNode);
                }
            });
        })
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

    var insertTopicSlottingNode = function (topicContentNode, slottingNode) {


        var firstPostCheck = topicContentNode.querySelector('[component="post"]');
        //exit if isn't first page

        if (firstPostCheck.getAttribute("data-index") != "0") {
            return false;
        }

        var content = topicContentNode.querySelector('[component="post/content"]');
        //replace we updated data if the slotting component already exists
        var existingSlottingComponentNode = content.querySelector('[component="topic/slotting"]');


        var postBarNode = firstPostCheck.querySelector('[class="post-bar"]');

        //only insert attendance if the postbar exists (if this is the first post)
        if (postBarNode) {
            postBarNode.parentNode.insertBefore(slottingNode, postBarNode);
            if (true) {
                insertSlottingButton(topicContentNode);
            }
        } else if (topicContentNode.children.length === 1) {
            firstPostCheck.appendChild(slottingNode);
            if (true) {
                insertSlottingButton(topicContentNode);
            }
        }


        if (existingSlottingComponentNode) {
            content.replaceChild(slottingNode, existingSlottingComponentNode);
            refreshToolTips();
            return true;
        } else if (content.children.length === 1) {
            content.appendChild(slottingNode);
            refreshToolTips();
        }
        refreshToolTips();

        // console.log("appendChild...");

        /*
         var contentNode = topicContentNode.querySelector('[class="shittshits"]');

         //only insert attendance if the postbar exists (if this is the first post)
         if (contentNode) {
         contentNode.parentNode.insertBefore(topicContentNode, contentNode);

         } else if (topicContentNode.children.length === 1) {
         content.appendChild(slottingNode);

         } */
    };

    var topicLoaded = function () {
        Array.prototype.forEach.call(document.querySelectorAll('[component="topic"]'), function (topicNode) {
            if (isMission(getTopicTitle(document))) {
                var topicId = parseInt(topicNode.getAttribute('data-tid'), 10);
                async.parallel(
                    [
                        _.partial(getMatches, topicId),
                        _.partial(getTemplates, ['tile_master.ejs', 'tile_slave.ejs', 'company.ejs', 'platoon.ejs', 'squad.ejs', 'fireteam.ejs', 'slot.ejs'])
                    ],
                    function (err, results) {
                        var matches = results[0];
                        var templatesArray = results[1];
                        window.pluginArma3SlottingTemplates = {
                            company: _.template(templatesArray[2], {variable: 'x'}),
                            platoon: _.template(templatesArray[3], {variable: 'x'}),
                            squad: _.template(templatesArray[4], {variable: 'x'}),
                            fireteam: _.template(templatesArray[5], {variable: 'x'}),
                            slot: _.template(templatesArray[6], {variable: 'x'}),
                        };
                        var masterTemplate = _.template(templatesArray[0], {variable: 'x'});
                        // var slaveTemplate = _.template(templatesArray[1]);

                        matches.forEach(function (match) {
                            var markup = masterTemplate(match);

                            var node = document.createElement('div');
                            node.setAttribute('component', 'topic/arma3-slotting');
                            node.innerHTML = markup;

                            // console.log("slotting code reached");

                            //document.body.appendChild(node);
                            insertTopicSlottingNode(topicNode, node);
                            console.log("insertTopicSlottingNode...");
                        });
                    }
                );
            }
        });
    };

    $(window).bind('action:topic.loaded', topicLoaded);

});
