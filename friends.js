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
        displayFriends(friends);
    }
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
        console.log(response);
        console.log(response.error);
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

async function declineRequest(friendid) {
    let userid = parseInt(getCookie('userid'));
    friendid = parseInt(friendid);
    let response = await fetch('/declinerequest', {
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
        alert('Error declining friend request');
        return;
    } else {
        loadPage();
    }
}

async function removeFriend(friendid) {
    let userid = parseInt(getCookie('userid'));
    friendid = parseInt(friendid);
    let response = await fetch('/removefriend', {
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
        alert('Error removing friend');
        return;
    } else {
        loadPage();
    }
}

document.body.onclick = function(event) {
    if (event.target.classList.contains('friend-id') || event.target.classList.contains('friend-uname') || event.target.classList.contains('friend-container')) {
        if (event.target.closest('.friendInfo')) {
            const friendIdElement = event.target.closest('.friendInfo').querySelector('.friend-id');
            if (friendIdElement) {
                const friendId = friendIdElement.id;
                setSessionCookie('friendid', friendId);
                window.location.href = '/friend_calendar.html';
            }
        }
    } 
};