define('arma3-slotting/eventTopicLoadedService', ['async', 'underscore'], function () {

    var getEventDate = function (title) {
        var dateMatch = title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})([^0-9a-z])/i);
        return dateMatch ? new Date(dateMatch[1]) : null;
    };

    function getTopicTitle(categoryTopicComponentNode) {
        var titleElement = categoryTopicComponentNode.querySelector('[component="topic/header"] a, [component="topic/title"]');
        return titleElement.getAttribute('content') || titleElement.textContent || '';
    }


    var topicLoaded = function () {
        _.each(document.querySelectorAll('[component="topic"]'), function (topicNode) {
            var eventDate = getEventDate(getTopicTitle(document));
            if (eventDate) {
                $(window).trigger('action:event-topic.loaded', [topicNode, eventDate]);
            }
        });
    };


    $(window).bind('action:topic.loaded', topicLoaded);
    $(document).ready(topicLoaded);

    return {
        subscribe: function (cb) {
            $(window).bind('action:event-topic.loaded', cb);
        }
    }
});
