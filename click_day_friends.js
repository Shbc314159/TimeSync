document.addEventListener("click", function(event) {
    const x = event.clientX;
    const y = event.clientY;

    const elements = document.elementsFromPoint(x, y);
    let calendarBox = elements.filter(element => element.classList.contains('calendar-box'));
    
    if (calendarBox.length === 0) return;

    let boxNum = calendarBox[0].querySelector('.boxnum');
    if (!boxNum) return;

    const boxId = parseInt(boxNum.textContent);
    if (!boxId) return;
    
    setSessionCookie('day', boxId);
    window.location.href = '/view_day_friend.html';
});