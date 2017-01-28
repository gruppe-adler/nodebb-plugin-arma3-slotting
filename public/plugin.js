require(['async'], function (async) {

    console.log("arma3-slotting plugin js successfully started");

    (function () {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = '/plugins/nodebb-plugin-arma3-slotting/css/styles.css?v=2';
        document.head.appendChild(css);
    }());

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
                function (err, templates) {
                    callback(err, templates);
                }
        );
    };

     var getTemplate = (function () {
        var loadedTemplates = {};
        return function (templateName, cb) {
            templateName = '/plugins/nodebb-plugin-arma3-slotting/templates/' + templateName;
            if (loadedTemplates[templateName]) {
                cb(loadedTemplates[templateName]);
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

    };

    // cb = callback
    function getMatches(topicId, cb) {
        $.get('/api/arma3-slotting/' + topicId, function (response) {
            if (typeof response == 'string') {
                response = JSON.parse(response)
            }

            cb(response);
        });
    }


    function ensureArray (element) {
		if (element) {
		    if (!Array.isArray(element)) {
		         element = [element];
		    }
		} else {
			element = [];
		}
		return element;
	}

    


    function filterHierarchy(current_match) {

    	var companies = ensureArray(current_match.company);
    	/*
        var platoon = ensureArray(current_match.platoon);
    	var squad = ensureArray(current_match.squad);
    	var fireteam = ensureArray(current_match.fireteam);
        */

        var platoon = ensureArray(current_match.platoon);
        var squad = ensureArray(current_match.squad);
        var fireteam = ensureArray(current_match.fireteam);

        companies.forEach(function(units) {
            console.log(units);
        });

        platoon.forEach(function(units) {
            console.log(units);
        });

        squad.forEach(function(units) {
            console.log(units);
        });

        fireteam.forEach(function(units) {
            console.log(units);
        });


        var returnArray = [companies, platoon, squad, fireteam];

    	return returnArray;
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

        if (existingSlottingComponentNode) {
            content.replaceChild(slottingNode, existingSlottingComponentNode);
            refreshToolTips();
            return true;
        } else if (content.children.length === 1) {
            content.appendChild(slottingNode);
            refreshToolTips();
        }

        
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
                getMatches(topicId, function (response) {
                    getTemplates(['tile_master.ejs', 'tile_slave.ejs'], function (err, templates) {
                        var masterTemplate = templates[0];
                        var compiledTemplateMaster = _.template(masterTemplate);

                        Object.keys(response).forEach(function (match_uuid) {
                            var match = response[match_uuid];
                            var allTheUnits = filterHierarchy(match);

                            /*
                            allTheUnits.forEach(function(entry) {
                                console.log(entry);
                                entry.forEach(function(units) {
                                    console.log(units);
                                });
                            });
                            */

                            // für jede der companies aufgerufen und durchs template gejagt
                            var markup = allTheUnits.map(compiledTemplateMaster).join("");

                            var node = document.createElement('div');
                            node.setAttribute('component', 'topic/arma3-slotting');
                            node.innerHTML = markup;

                            // console.log("slotting code reached");

                            document.body.innerHTML = markup;
                            insertTopicSlottingNode(topicNode, node);
                            console.log("insertTopicSlottingNode...");
                        })
                    });
                });
            }
        });
    };

    $(window).bind('action:topic.loaded', topicLoaded);

});
