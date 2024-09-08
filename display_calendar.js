var root = null;

function Title(_ref) {
    var text = _ref.text;

    return React.createElement(
        "h1",
        { id: "title" },
        text
    );
}

function BoxNumber(_ref2) {
    var firstDay = _ref2.firstDay,
        boxnum = _ref2.boxnum,
        numDays = _ref2.numDays;

    if (boxnum >= firstDay && boxnum < numDays + firstDay) {
        return React.createElement(
            "p",
            { className: "boxnum" },
            boxnum - firstDay + 1
        );
    } else if (boxnum < firstDay) {
        return React.createElement(
            "p",
            { className: "boxnum", style: { opacity: "0%" } },
            "Space"
        );
    }
}

function Events(_ref3) {
    var data = _ref3.data,
        boxnum = _ref3.boxnum,
        firstDay = _ref3.firstDay,
        longEvents = _ref3.longEvents,
        lines = _ref3.lines,
        eventsNotDisplayed = _ref3.eventsNotDisplayed;

    var monthDay = boxnum - firstDay + 1;
    var startDay = new Date(year, month, monthDay, 0, 0, 0);
    var endDay = new Date(year, month, monthDay, 23, 59, 59);
    var eventElements = [];

    var _loop = function _loop(event) {
        var k = eventsNotDisplayed.indexOf(event.id);
        if (k != -1) {
            return "continue";
        }

        var startTime = new Date(event.start_time);
        var endTime = new Date(event.end_time);
        var add = true;

        for (var i = 0; i < lines.length; i++) {
            if (lines[i] == null) {
                continue;
            }
            if (new Date(lines[i].end_time) < startDay) {
                lines[i] = null;
            }
        }

        if (endTime > startDay && startTime < endDay) {
            var _loop2 = function _loop2(longevent) {
                if (event.id == longevent.id) {
                    if (new Date(longevent.end_time) < endDay) {
                        // if the long event ends today it must be removed from the list
                        longEvents.splice(longEvents.indexOf(longevent), 1);
                        React.useEffect(function () {
                            shortenElement(longevent.id);
                        }, []);
                    }
                    add = false;
                    return "break";
                }
            };

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = longEvents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var longevent = _step2.value;

                    var _ret2 = _loop2(longevent);

                    if (_ret2 === "break") break;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            if (add) {
                // this bit is if the event starts on this day
                for (var _i = 0; _i < lines.length; _i++) {
                    if (event.id == 300 || event.id == 303) {}
                    if (lines[_i] == null) {
                        lines[_i] = event;
                        break;
                    }
                }
                var index = lines.indexOf(event);
                var numpixels = index * 30 + 2;
                var color = getRandomColor();
                if (index < 3 && index > -1) {
                    eventElements.push(React.createElement(
                        "p",
                        { key: event.id, id: "event" + event.id, className: "event", style: { marginTop: numpixels + "px", backgroundColor: "" + color } },
                        event.name
                    ));
                } else {
                    eventsNotDisplayed.push(event.id);
                    return "continue";
                }
            };

            if (endTime > endDay) {
                // if the event doesn't end on this day
                longEvents.push(event);
                if (startDay.getDay() === 0) {
                    var _index = lines.indexOf(event);
                    var _numpixels = _index * 30 + 2;
                    React.useEffect(function () {
                        wrapToNextLine(event.id, boxnum, _numpixels);
                    }, []);
                } else {
                    React.useEffect(function () {
                        widenElement(event.id);
                    }, []);
                }
            }
        }
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var event = _step.value;

            var _ret = _loop(event);

            if (_ret === "continue") continue;
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

    return eventElements;
}

function CalendarBoxes(_ref4) {
    var data = _ref4.data;

    var numBoxes = 42;
    var boxes = [];
    month = getCookie('month', 10);
    year = getCookie('year'), 10;
    var longEvents = [];
    var firstDay = new Date(year, month, 1).getDay() - 1;
    firstDay < 0 ? firstDay += 7 : null;
    var numDays = new Date(year, month + 1, 0).getDate();
    var lines = Array(3).fill(null);
    var eventsNotDisplayed = [];

    for (var i = 0; i < numBoxes; i++) {
        var style = (i + 1) % 7 === 0 ? { borderRight: 0 } : {};
        boxes.push(React.createElement(
            "div",
            { key: i, className: "calendar-box", style: style, id: "calendar-box" + i },
            React.createElement(BoxNumber, { firstDay: firstDay, boxnum: i, numDays: numDays }),
            React.createElement(Events, { data: data, boxnum: i, firstDay: firstDay, longEvents: longEvents, lines: lines, eventsNotDisplayed: eventsNotDisplayed })
        ));
    }
    return React.createElement(
        "div",
        { id: "calendar-box-container" },
        boxes
    );
}

function displayCalendar(data) {
    if (root == null) {
        var domContainer = document.querySelector('#calendar');
        root = ReactDOM.createRoot(domContainer);
    }
    var monthName = getMonthName(getCookie('month'));
    var year = getCookie('year');
    root.render(React.createElement(
        "div",
        null,
        React.createElement(
            "div",
            { id: "top-bar" },
            React.createElement(
                "button",
                { onClick: prevMonth, id: "backmonth" },
                React.createElement("img", { id: "backmonthimg", src: "back-arrow.png" })
            ),
            React.createElement(Title, { text: monthName + ' ' + year }),
            React.createElement(
                "button",
                { onClick: nextMonth, id: "forwardmonth" },
                React.createElement("img", { id: "forwardmonthimg", src: "forward-arrow.png" })
            )
        ),
        React.createElement(
            "ul",
            { id: "weekday-list" },
            React.createElement(
                "li",
                { className: "weekday-title" },
                "Mon"
            ),
            React.createElement(
                "li",
                { className: "weekday-title" },
                "Tue"
            ),
            React.createElement(
                "li",
                { className: "weekday-title" },
                "Wed"
            ),
            React.createElement(
                "li",
                { className: "weekday-title" },
                "Thu"
            ),
            React.createElement(
                "li",
                { className: "weekday-title" },
                "Fri"
            ),
            React.createElement(
                "li",
                { className: "weekday-title" },
                "Sat"
            ),
            React.createElement(
                "li",
                { className: "weekday-title", style: { borderRight: 0 } },
                "Sun"
            )
        ),
        React.createElement(CalendarBoxes, { data: data })
    ));
}

function getMonthName(monthNumber) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[monthNumber];
}

window.displayCalendar = displayCalendar;