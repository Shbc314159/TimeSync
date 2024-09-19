async function viewEvent() {
    eventid = getCookie('eventid');
    if (getCookie('isAddedEvent') == 'true') {
        modifyPage();
    }

    const response = await fetch('/getEventInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            eventid: eventid
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error fetching event info:', errorData.error);
    }

    const data = await response.json();

    let nameElement = document.querySelector('#name-input');
    let idElement = document.querySelector('#id');
    let descriptionElement = document.querySelector('#description-input');
    let startElement = document.querySelector('#start-input');
    let endElement = document.querySelector('#end-input');
    let repeatsElement = document.querySelector('#repeat-input');

    let visible = [];
    let added = [];
    for (let friend of data.visibleFriends) {
        visible.push(friend.username);
    }
    for (let friend of data.addedFriends) {
        added.push(friend.username);
    }

    idElement.textContent = 'Event' + ' ' + '#' + eventid;
    nameElement.value = data.result.name;
    descriptionElement.value = data.result.description;
    startElement.value = new Date(data.result.start_time).toISOString().slice(0, 16);
    endElement.value = new Date(data.result.end_time).toISOString().slice(0, 16);
    repeatsElement.selectedIndex = parseInt(data.result.repeats);
    loadFriendOptions(added);
    loadVisibleFriends(visible);
}

async function loadFriendOptions(friendsAdded) {
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
    let list = document.getElementById('added-users-list');

    for (let i = 0; i < data.length; i++) {

        for (let j = 0; j < friendsAdded.length; j++) {
            friend1 = data[i][1];
            friend2 = friendsAdded[j];
            if (friend1 == friend2) {
                const element = document.createElement('li');
                element.textContent = friend1;
                list.appendChild(element);
                list.style.border = "2px solid rgb(0, 191, 255)";
                matchFound = true;
                break;
            }
        }

        const option = document.createElement('option');
        option.value = data[i][0];
        option.textContent = data[i][1];
        addUsersInput.appendChild(option);
    }

    setSessionCookie2dArr('friends', data);
}

function goHome() {
    document.location.href = '/view_day.html';
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

async function loadVisibleFriends(visibleFriends) {
    const friends = getCookie('friends');
    const container = document.getElementById('visible-friends-container');

    for (const friend of friends) {
        let visible = false;
        const outerDiv = document.createElement('div');
        const element = document.createElement('p');
        element.textContent = friend[1];
        element.className = 'friend-name';
        outerDiv.appendChild(element);
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'friend-checkbox';
        for (const visibleFriend of visibleFriends) {
            if (friend[1] == visibleFriend) {
                visible = true;
                break;
            }
        }
        visible ? check.checked = true : check.checked = false;
        outerDiv.appendChild(check);
        container.appendChild(outerDiv);
    }
    
}

async function deleteEvent() {
    eventid = getCookie('eventid');
    const response = await fetch('/deleteEvent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            eventid: eventid
        })
    });

    if (!response.ok) {
        const errorData = await response;
        alert('Error deleting event:', errorData.error);
    } else {
        await response;
        alert('Event deleted successfully');
        window.location.href = './view_day.html';
    }
}

async function saveEvent() {
    createEvent();
    alert('Event saved successfully');
}

async function createEvent() {
    const ogeventid = getCookie('eventid');
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
            addedDays = 0
            while (addedDays < 1000) {
                addedDays += repeats;
                let startTime = new Date(document.getElementById('start-input').value);
                let endTime = new Date(document.getElementById('end-input').value);
                let newStartTime = new Date(startTime.setDate(startTime.getDate() + addedDays));
                let newEndTime = new Date(endTime.setDate(endTime.getDate() + addedDays));
                await createEventWithData(userid, eventName, eventDescription, newStartTime.toISOString(), newEndTime.toISOString(), repeats, addedFriends, visibleFriends, og_id);
            }
        }

        const response2 = await fetch('/deleteEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventid: ogeventid
            })
        });
    
        if (!response2.ok) {
            const errorData = await response;
            alert('Error deleting event:', errorData.error);
        }
    }
}

async function createEventWithData(userid, eventName, eventDescription, startTime, endTime, repeats, addedFriends, visibleFriends, og_id=null) {
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
            og_id: og_id
        })
    });
}

function modifyPage() {
    const buttonsDiv = document.getElementById("buttonsdiv");
    const deleteButton = document.getElementById("deletebutton");
    const savebutton = document.getElementById("savebutton");

    buttonsDiv.removeChild(savebutton);
    buttonsDiv.removeChild(deleteButton);

    const leaveButton = document.createElement("button");
    leaveButton.id = "deletebutton";
    leaveButton.textContent = "Leave";
    leaveButton.onclick = leaveEvent;

    buttonsDiv.appendChild(leaveButton);
}

async function leaveEvent() {
    eventid = getCookie('eventid');
    userid = getCookie('userid');
    const response = await fetch('/leaveEvent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            eventid: eventid,
            userid: userid
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error leaving event:', errorData.error);
    } else {
        await response.json();
        alert('Event left successfully');
        window.location.href = './view_day.html';
    }
}   