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

let startX;

document.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) {
    // Swipe left
    onSwipeLeft();
  } else if (endX - startX > 50) {
    // Swipe right
    onSwipeRight();
  }
});

function onSwipeLeft() {
  nextMonth();
}

function onSwipeRight() {
  prevMonth();
}
