async function loadPage() {
    const usernameElement = document.getElementById('username');
    const userIdElement = document.getElementById('userID');

    usernameElement.textContent = `Username:  ${getCookie('username')}`;
    userIdElement.textContent = `UserID:  ${getCookie('userid')}`;

    const checkbox = document.getElementById('visibleCheckbox');

    const response = await fetch('/getvisible', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: getCookie('userid')
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error fetching visibility settings:', errorData.error);
    }

    const visible = await response.json(); 

    if (visible.eventsVisible === true) {
        checkbox.checked = true;
    } else {
        checkbox.checked = false;
    }
}


const checkbox = document.getElementById('visibleCheckbox');

checkbox.addEventListener('change', async () => {
    const response = await fetch('/switchVisible', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: getCookie('userid'),
        })
    });
    
    if (!response.ok) {
        const errorData = await response;
        alert('Error switching visibility settings:', errorData.error);
    }
});

function logout() {
    setSessionCookie('userid', null);
    setSessionCookie('username', null);
    window.location.href = '/login.html';
}

const select = document.getElementById('time-selector');
        for (let minutes = 5; minutes <= 90; minutes += 5) {
            const option = document.createElement('option');
            option.value = minutes;
            option.textContent = `${minutes} minutes`;
            select.appendChild(option);
}

async function scanTime() {
    const timelength = document.getElementById('time-selector').value * 60 * 1000;
    const response = await fetch('/scanTimes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: getCookie('userid'),
            timelength: timelength
        })
    });

    const data = await response.json();
    console.log(data);
}