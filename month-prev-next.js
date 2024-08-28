function prevMonth() {
    year = getCookie('year');
    month = getCookie('month');
    date = new Date(year, month);
    date.setMonth(date.getMonth() - 1);
    setSessionCookie('month', date.getMonth());
    setSessionCookie('year', date.getFullYear());
    location.reload();
}

function nextMonth() { 
    year = getCookie('year');
    month = getCookie('month');
    date = new Date(year, month);
    date.setMonth(date.getMonth() + 1);
    setSessionCookie('month', date.getMonth());
    setSessionCookie('year', date.getFullYear());
    location.reload();
}