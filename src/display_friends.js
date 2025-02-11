import { createRoot } from 'react-dom/client';

function FriendRequests({ data }) {
    const requests = data.map(request => (
        <div key={request.id} className='request-container'>
            <div className="requesterInfo">
                <p className="request-text"><span style={{ fontWeight: "550", fontSize: "20px" }}>{request.username}</span> wants to connect</p>
                <p className="request-id">UserID #{request.id}</p>
            </div>
            <button className="accept-request" onClick={() => acceptRequest(request.id)}>Accept</button>
            <button className="reject-request" onClick={() => declineRequest(request.id)}>Decline</button>
        </div>
    ));

    return <div>{requests}</div>;
}

function displayRequests(requests) {
    let domContainer = document.getElementById('friend-request-container');
    let root = ReactDOM.createRoot(domContainer);

    root.render(
        <FriendRequests data={requests} />
    );
}

window.displayRequests = displayRequests;

function Friends({ data }) {
    const friends = [];

    for (let i = 0; i < data.length; i++) {
        const friend = data[i];
        friends.push(
            <div key={i} className='friend-container'>
                <div className="friendInfo">
                    <p className="friend-uname">{friend[1]}</p>
                    <p className="friend-id" id={friend[0]}>UserID #{friend[0]}</p>
                </div>
                <button className="remove-friend" onClick={() => removeFriend(friend[0])}>Remove</button>
            </div>
        );
      }

    return <div>{friends}</div>;
}

function displayFriends(data) {
    let domContainer = document.getElementById('friends-container');
    let root = createRoot(domContainer);

    root.render(
        <Friends data={data} />
    );
}

window.displayFriends = displayFriends;