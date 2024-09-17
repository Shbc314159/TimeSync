async function loadFriendOptions() {
    const addUsersInput = document.getElementById('addedUsers-input');
    const userid = getCookie('userid');

    const response = await fetch('/getfriends', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error fetching friends:', errorData.error);
    }

    const data = await response.json();

    for (const dataRow of data) {
        const option = document.createElement('option');
        option.value = dataRow[0];
        option.textContent = dataRow[1];
        addUsersInput.appendChild(option);
    };
    setSessionCookie2dArr('friends', data);
    loadVisibleFriends();
}

async function loadVisibleFriends() {
    const friends = getCookie('friends');
    const userid = getCookie('userid');
    const container = document.getElementById('visible-friends-container');

    const response = await fetch('/getVisible', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid
        })
    });

    if (!response.ok) {
        const errorData = await response;
        alert('Error fetching friends:', errorData.error);
    }

    const eventsVisible = await response.json();

    for (const friend of friends) {
        const outerDiv = document.createElement('div');
        const element = document.createElement('p');
        element.textContent = friend[1];
        element.className = 'friend-name';
        outerDiv.appendChild(element);
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'friend-checkbox';
        eventsVisible.eventsVisible ? check.checked = true : check.checked = false;
        outerDiv.appendChild(check);
        container.appendChild(outerDiv);
    }
    
}

function addFriend() {
    let list = document.getElementById('added-users-list');
    const addUsersInput = document.getElementById('addedUsers-input');
    const selectedFriendId = addUsersInput.value;
    var friendUsername;

    for (let row of getCookie('friends')) {
        if (row[0] == selectedFriendId) {
            friendUsername = row[1];
            break;
        }
    }

    if (!Array.from(list.querySelectorAll('li')).some(li => li.textContent.trim() === friendUsername)) {
        const element = document.createElement('li');
        element.textContent = friendUsername;
        list.appendChild(element);
        list.style.border = "2px solid rgb(0, 191, 255)"; 
    } else {
        alert("Friend already added");
    }
}

function removeFriend() {
    let list = document.getElementById('added-users-list');
    const addUsersInput = document.getElementById('addedUsers-input');
    const selectedFriendId = addUsersInput.value;
    var friendUsername;

    for (let row of getCookie('friends')) {
        if (row[0] == selectedFriendId) {
            friendUsername = row[1];
            break;
        }
    }

    if (Array.from(list.querySelectorAll('li')).some(li => li.textContent.trim() === friendUsername)) {
        list.querySelectorAll('li').forEach(li => {
            if (li.textContent.trim() === friendUsername) {
              li.remove();  
            }
        });
    } else {
        alert("Friend not added");
    }
}

async function createNewEvent() {
    const userid = getCookie('userid');
    const eventName = document.getElementById('name-input').value;
    const eventDescription = document.getElementById('description-input').value;
    let startTime;
    let endTime;
    try {
        startTime = new Date(document.getElementById('start-input').value).toISOString();
        endTime = new Date(document.getElementById('end-input').value).toISOString();  
    } catch (error) {
        if (error instanceof RangeError) {
            alert('Please enter valid datetimes for the start and end of the event.');
            return;
        }
    }
    const repeats = parseInt(document.getElementById('repeat-input').value);

    let addedFriends = [];
    let addedList = document.getElementById('added-users-list');
    for (let i = 0; i < addedList.children.length; i++) {
        let friendUsername = addedList.children[i].textContent;
        for (let row of getCookie('friends')) {
            if (row[1] == friendUsername) {
                addedFriends.push(row[0]);
                break;
            }
        }
    }

    let visibleFriends = [];
    let visibleList = document.getElementById('visible-friends-container');
    for (let i = 0; i < visibleList.children.length; i++) {
        let friendCheckbox = visibleList.children[i].children[1];
        if (friendCheckbox.checked) {
            let friendUsername = visibleList.children[i].children[0].textContent;
            for (let row of getCookie('friends')) {
                if (row[1] == friendUsername) {
                    visibleFriends.push(row[0]);
                    break;
                }
            }
        }
    }

    if (eventName.trim() === '') {
        alert('Please give a name.');
        return;
    }

    if (eventName.length > 100) {
        alert('Event name should not exceed 100 characters.');
        return;
    }

    if (eventDescription.length > 1000) {
        alert('Event description should not exceed 1000 characters.');
        return;
    }

    if (startTime > endTime) {
        alert('Please ensure the start time is before the end time.');
        return;
    } 

    const response = await fetch('/createevent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid,
            eventName: eventName,
            eventDescription: eventDescription,
            startTime: startTime,
            endTime: endTime,
            repeats: repeats,
            addedFriends: addedFriends,
            visibleFriends: visibleFriends,
            og_id: null
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error creating event:', errorData.error);
    } else {
        const response1 = await response.json();
        const og_id = response1.id;
        if (repeats != 0) {
            alert('Please wait a few seconds for all future events to be created.');
            let repeatsCreated = await createRepeatedEvents(userid, eventName, eventDescription, new Date(startTime), new Date(endTime), repeats, addedFriends, visibleFriends, og_id);
        }

        alert('Event created successfully!');
        location.reload();
    }
}

async function createRepeatedEvents(userid, eventName, eventDescription, startTime, endTime, repeats, addedFriends, visibleFriends, og_id) {
    let startTimes = []
    let endTimes = []  
    for (let i = 0; i < 100; i++) {
        let newStartTime = new Date(startTime.setDate(startTime.getDate() + repeats));
        let newEndTime = new Date(endTime.setDate(endTime.getDate() + repeats));
        startTimes.push(newStartTime.toISOString());
        endTimes.push(newEndTime.toISOString());
    }

    const response = await fetch('/createrepeatedevent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid,
            eventName: eventName,
            eventDescription: eventDescription,
            startTimes: startTimes,
            endTimes: endTimes,
            repeats: repeats,
            addedFriends: addedFriends,
            visibleFriends: visibleFriends,
            og_id: og_id
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error creating event:', errorData.error);
        return 1;
    } else {
        return 0;
    }
}