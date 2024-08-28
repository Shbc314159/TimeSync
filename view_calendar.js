async function viewCalendar() {
    userid = getCookie('userid');
    month = getCookie('month');
    year = getCookie('year');

    if (month == null || year == null) {
        month = new Date().getMonth();
        year = new Date().getFullYear();
        setSessionCookie('month', month);
        setSessionCookie('year', year);
    }

    const response = await fetch(`/calendarMonthView`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            userid: userid,
            month: month,
            year: year
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error fetching calendar data:', errorData.error);
    }

    const data = await response.json();
    displayCalendar(data);
}