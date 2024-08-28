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

function loadVisibleFriends() {
    const friends = getCookie('friends');
    const container = document.getElementById('visible-friends-container');
    

    for (const friend of friends) {
        const outerDiv = document.createElement('div');
        const element = document.createElement('p');
        element.textContent = friend[1];
        element.className = 'friend-name';
        outerDiv.appendChild(element);
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'friend-checkbox';
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

    var selectedIndex = addUsersInput.selectedIndex;
    addUsersInput.remove(selectedIndex);

    const element = document.createElement('li');
    element.textContent = friendUsername;
    list.appendChild(element);
}

async function createNewEvent() {
    const userid = getCookie('userid');
    const eventName = document.getElementById('name-input').value;
    const eventDescription = document.getElementById('description-input').value;
    const startTime = new Date(document.getElementById('start-input').value).toISOString();
    const endTime = new Date(document.getElementById('end-input').value).toISOString();    
    const repeats = document.getElementById('repeat-input').value;
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
            visibleFriends: visibleFriends
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert('Error creating event:', errorData.error);
    } else {
        alert('Event created successfully!');
        location.reload();
    }
}
