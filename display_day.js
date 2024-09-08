var root = null;

function EventList(_ref) {
    var data = _ref.data;

    var events = [];
    var year = getCookie('year');
    var month = getCookie('month');
    var day = getCookie('day');
    var start_day = new Date(year, month, day, 0, 0, 0);
    var end_day = new Date(year, month, day, 23, 59, 59);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var event = _step.value;

            start_time = new Date(event.start_time);
            end_time = new Date(event.end_time);

            var formatTime = function formatTime(date) {
                if (date < start_day) {
                    return '00:00';
                }
                if (date > end_day) {
                    return '23:59';
                }

                var hours = date.getHours().toString().padStart(2, '0');
                var minutes = date.getMinutes().toString().padStart(2, '0');
                return hours + ':' + minutes;
            };

            var color = getRandomColor();

            events.push(React.createElement(
                'div',
                { className: 'event', key: event.id },
                React.createElement(
                    'div',
                    { className: 'times' },
                    React.createElement(
                        'p',
                        { className: 'start-time' },
                        formatTime(start_time)
                    ),
                    React.createElement(
                        'p',
                        { className: 'end-time' },
                        formatTime(end_time)
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'eventBar', id: event.id, style: { backgroundColor: '' + color } },
                    React.createElement(
                        'p',
                        { className: 'eventName' },
                        event.name
                    )
                )
            ));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return React.createElement(
        'div',
        null,
        events
    );
}

function displayDay(data) {
    if (root == null) {
        var domContainer = document.getElementById('eventList');
        root = ReactDOM.createRoot(domContainer);
    }

    root.render(React.createElement(EventList, { data: data }));
}

window.displayDay = displayDay;