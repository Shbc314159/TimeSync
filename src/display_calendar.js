let root = null;

function Title({ text }) {
    return <h1 id="title">{text}</h1>;
}

function BoxNumber({ firstDay, boxnum, numDays }) {
    if (boxnum >= firstDay && boxnum < numDays + firstDay) {
        return <p className="boxnum">{boxnum - firstDay + 1}</p>
    } else if (boxnum < firstDay) {
        return <p className="boxnum" style={{opacity: "0%"}}>Space</p>
    }
}

function Events({ data, boxnum, firstDay, longEvents, lines, eventsNotDisplayed }) {
    const monthDay = boxnum - firstDay + 1;
    const startDay = new Date(year, month, monthDay, 0, 0, 0,);
    const endDay = new Date(year, month, monthDay, 23, 59, 59);
    const eventElements = [];


    for (let event of data) {
        let k = eventsNotDisplayed.indexOf(event.id);
        if (k != -1) {
            continue;
        }

        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        let add = true;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i] == null) {
                continue;
            }
            if ((new Date(lines[i].end_time)) < startDay) {
                lines[i] = null;
            }
        }

        if (endTime > startDay && startTime < endDay) {
            for (let longevent of longEvents) {
                if (event.id == longevent.id) {
                    if (new Date(longevent.end_time) < endDay) { // if the long event ends today it must be removed from the list
                        longEvents.splice(longEvents.indexOf(longevent), 1);
                        React.useEffect(() => {
                            shortenElement(longevent.id);
                        }, []);
                    }
                    add = false;
                    break;
                }
            }

            if (add) { // this bit is if the event starts on this day
                for (let i = 0; i < lines.length; i++) {
                    if (event.id == 300 || event.id == 303) {
                    }
                    if (lines[i] == null) {
                        lines[i] = event;
                        break;
                    }
                }
                let index = lines.indexOf(event);
                let numpixels = index * 30 + 2;
                let color = getRandomColor();
                if (index < 3 && index > -1) {
                    eventElements.push(<p key={event.id} id={`event${event.id}`} className="event" style={{marginTop: `${numpixels}px`, backgroundColor: `${color}`}}>{event.name}</p>);
                } else {
                    eventsNotDisplayed.push(event.id);
                    continue;
                }
            };

            if (endTime > endDay) { // if the event doesn't end on this day
                longEvents.push(event);
                if (startDay.getDay() === 0) {
                    let index = lines.indexOf(event);
                    let numpixels = index * 30 + 2;
                    React.useEffect(() => {
                        wrapToNextLine(event.id, boxnum, numpixels);
                    }, []);
                } else {
                    React.useEffect(() => {
                        widenElement(event.id);
                    }, []);
                }
            }
        }
    }

    return eventElements;
}

function CalendarBoxes({data}) {
    const numBoxes = 42;
    const boxes = [];
    month = getCookie('month', 10);
    year = getCookie('year'), 10;
    let longEvents = [];
    let firstDay = new Date(year, month, 1).getDay() - 1;
    firstDay < 0 ? firstDay += 7 : null;
    const numDays = new Date(year, month + 1, 0).getDate();
    let lines = Array(3).fill(null);
    let eventsNotDisplayed = [];

    for (let i = 0; i < numBoxes; i++) {
        const style = (i + 1) % 7 === 0 ? { borderRight: 0 } : {};
        boxes.push(
            <div key={i} className="calendar-box" style={style} id={`calendar-box${i}`}>
                <BoxNumber firstDay={firstDay} boxnum={i} numDays={numDays}/>
                <Events data={data} boxnum={i} firstDay={firstDay} longEvents={longEvents} lines={lines} eventsNotDisplayed={eventsNotDisplayed}/>
            </div>
        );
    }
    return <div id="calendar-box-container">{boxes}</div>;
} 

function displayCalendar(data) {
    if (root == null) {
        const domContainer = document.querySelector('#calendar');
        root = ReactDOM.createRoot(domContainer);
    }
    const monthName = getMonthName(getCookie('month'))
    const year = getCookie('year');
    root.render(
        <div>
            <div id="top-bar">
                <button onClick={prevMonth} id="backmonth"><img id="backmonthimg" src="back-arrow.png"></img></button>
                <Title text={monthName + ' ' + year}/>
                <button onClick={nextMonth} id="forwardmonth"><img id="forwardmonthimg" src="forward-arrow.png"></img></button>
            </div>
            <ul id="weekday-list">
                <li className="weekday-title">Mon</li>
                <li className="weekday-title">Tue</li>
                <li className="weekday-title">Wed</li>
                <li className="weekday-title">Thu</li>
                <li className="weekday-title">Fri</li>
                <li className="weekday-title">Sat</li>
                <li className="weekday-title" style={{ borderRight: 0 }}>Sun</li>
            </ul>
            <CalendarBoxes data={data}/>
        </div>
    );
}

function getMonthName(monthNumber) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber];
}

window.displayCalendar = displayCalendar;