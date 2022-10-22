define('arma3-slotting/eventTopicLoadedService', function () {

    const getEventDate = function (title) {
        const dateMatch = title.trim().match(/([0-9]{4}-[0-9]{2}-[0-9]{2})([^0-9a-z])/i);
        return dateMatch ? new Date(dateMatch[1]) : null;
    };

    function getTopicTitle(categoryTopicComponentNode) {
        const titleElement = categoryTopicComponentNode.querySelector('[component="topic/header"] a, [component="topic/title"]');
        return titleElement.getAttribute('content') || titleElement.textContent || '';
    }

    const topicLoaded = function () {
        document.querySelectorAll('[component="topic"]').forEach((topicNode) => {
            const eventDate = getEventDate(getTopicTitle(document));
            if (eventDate) {
                $(window).trigger('action:event-topic.loaded', [topicNode, eventDate]);
            }
        });
    };

    $(window).bind('action:topic.loaded', topicLoaded);

    return {
        subscribe: function (cb) {
            $(window).bind('action:event-topic.loaded', cb);
        }
    }
});
