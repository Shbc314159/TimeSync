function FriendRequests({ data }) {
    const requests = data.map(request => (
        <div key={request.id} className='request-container'>
            <div className="requesterInfo">
                <p className="request-text"><span style={{ fontWeight: "550", fontSize: "20px" }}>{request.username}</span> wants to connect</p>
                <p className="request-id">#{request.id}</p>
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