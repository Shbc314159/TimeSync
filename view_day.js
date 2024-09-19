async function viewDay() {
    header = document.getElementById('dayHeader');
    day = getCookie('day');
    month = getCookie('month');
    year = getCookie('year');
    actualmonth = month + 1;
    header.innerHTML = day + "/" + actualmonth + "/" + year;

    userid = getCookie('userid');

    if (month == null || year == null || day == null) {
        month = new Date().getMonth(); 
        year = new Date().getFullYear();
        day = new Date().getDate();
        setSessionCookie('month', month);
        setSessionCookie('year', year);
        setSessionCookie('day', day);
    }

    const response = await fetch(`/calendarDayView`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid,
            day: day,
            month: month,
            year: year
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error fetching calendar data:', errorData.error);
    }

    const data = await response.json();
    displayDay(data);
}

function forwardDay() {
    day = parseInt(getCookie('day'), 10);
    month = parseInt(getCookie('month'), 10);
    year = parseInt(getCookie('year'), 10);

    date = new Date(year, month, day);
    date.setDate(date.getDate() + 1);
    setSessionCookie('day', date.getDate());
    setSessionCookie('month', date.getMonth());
    setSessionCookie('year', date.getFullYear());

    location.reload();
}

function backDay() {
    day = parseInt(getCookie('day'), 10);
    month = parseInt(getCookie('month'), 10);
    year = parseInt(getCookie('year'), 10);

    date = new Date(year, month, day);
    date.setDate(date.getDate() - 1);
    setSessionCookie('day', date.getDate());
    setSessionCookie('month', date.getMonth());
    setSessionCookie('year', date.getFullYear());

    location.reload();
}

function goHome() {
    window.location.href = '/calendar.html';
}

const colors = [
    // Warm and muted colors
    '#E94E77', // Muted red
    '#4CAF50', // Muted green
    '#2979FF', // Muted blue
    '#6A5ACD', // Muted purple
    '#f5be1b', // Muted yellow
    '#b03aa0', // More reddish muted pink
  ];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener("click", function(event) {
    const x = event.clientX;
    const y = event.clientY;

    const elements = document.elementsFromPoint(x, y);
    let eventBox = elements.filter(element => element.classList.contains('eventBar'));
    setSessionCookie('eventid', eventBox[0].id);
    setSessionCookie('isAddedEvent', eventBox[0].dataset.added);

    window.location.href = '/view_event.html';
});