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