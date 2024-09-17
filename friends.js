async function loadPage() {
    let userid = getCookie('userid');
    let response = await fetch('/getrequests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid
        })
    });

    if (!response.ok) {
        alert('Error loading friend requests');
        return;
    } else {
        let requests = await response.json();
        displayRequests(requests.requests);
    }

    response = await fetch('/getfriends', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid
        })
    });
    
    if (!response.ok) {
        alert('Error loading friends');
        return;
    } else {
        let friends = await response.json();
        displayFriends(friends.friends);
    }
}

function displayFriends(friends) {
    console.log(friends);
}

async function requestFriend() {
    let friendId = parseInt(document.getElementById('friend-id-input').value);
    let response = await fetch('/requestfriend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: parseInt(getCookie('userid')),
            friendid: friendId
        })
    });

    if (!response.ok) {
        if (response.status == 700) {
            alert('Error: users are already friends');
        } else {
            alert('Error requesting friend');
        }
        return;
    } else {
        alert('Friend request sent');
    }
}

async function acceptRequest(friendid) {
    let userid = parseInt(getCookie('userid'));
    friendid = parseInt(friendid);
    let response = await fetch('/acceptrequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userid,
            friendid: friendid
        })
    });

    if (!response.ok) {
        alert('Error accepting friend request');
        return;
    } else {
        alert('Friend request accepted');
        loadPage();
    }
}