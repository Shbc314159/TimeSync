let root = null;

function EventList({ data }) { 
    const events = [];
    const year = getCookie('year');
    const month = getCookie('month');
    const day = getCookie('day');
    const start_day = new Date(year, month, day, 0, 0, 0);
    const end_day = new Date(year, month, day, 23, 59, 59);

    for (const event of data) {
        start_time = new Date(event.start_time);
        end_time = new Date(event.end_time);

        const formatTime = (date) => {
            if (date < start_day) {
                return `00:00`;
            }
            if (date > end_day) {
                return `23:59`;
            }

            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        let color = getRandomColor();


        events.push(
            <div className='event' key={event.id}>
                <div className='times'>
                    <p className='start-time'>{formatTime(start_time)}</p>
                    <p className='end-time'>{formatTime(end_time)}</p>
                </div>
                <div className="eventBar" id={event.id} data-added={event.isaddedevent} style={{backgroundColor: `${color}`}}>
                    <p className='eventName'>{event.name}</p>
                </div>
            </div> 
        )
    }
    return <div>{events}</div>
}

function displayDay(data) {
    if (root == null) {
        const domContainer = document.getElementById('eventList');
        root = ReactDOM.createRoot(domContainer);
    }

    root.render(
        <EventList data={data} />
    );
} 

window.displayDay = displayDay;