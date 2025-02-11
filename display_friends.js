import { createRoot } from 'react-dom/client';

function FriendRequests(_ref) {
    var data = _ref.data;

    var requests = data.map(function (request) {
        return React.createElement(
            'div',
            { key: request.id, className: 'request-container' },
            React.createElement(
                'div',
                { className: 'requesterInfo' },
                React.createElement(
                    'p',
                    { className: 'request-text' },
                    React.createElement(
                        'span',
                        { style: { fontWeight: "550", fontSize: "20px" } },
                        request.username
                    ),
                    ' wants to connect'
                ),
                React.createElement(
                    'p',
                    { className: 'request-id' },
                    'UserID #',
                    request.id
                )
            ),
            React.createElement(
                'button',
                { className: 'accept-request', onClick: function onClick() {
                        return acceptRequest(request.id);
                    } },
                'Accept'
            ),
            React.createElement(
                'button',
                { className: 'reject-request', onClick: function onClick() {
                        return declineRequest(request.id);
                    } },
                'Decline'
            )
        );
    });

    return React.createElement(
        'div',
        null,
        requests
    );
}

function displayRequests(requests) {
    var domContainer = document.getElementById('friend-request-container');
    var root = ReactDOM.createRoot(domContainer);

    root.render(React.createElement(FriendRequests, { data: requests }));
}

window.displayRequests = displayRequests;

function Friends(_ref2) {
    var data = _ref2.data;

    var friends = [];

    var _loop = function _loop(i) {
        var friend = data[i];
        friends.push(React.createElement(
            'div',
            { key: i, className: 'friend-container' },
            React.createElement(
                'div',
                { className: 'friendInfo' },
                React.createElement(
                    'p',
                    { className: 'friend-uname' },
                    friend[1]
                ),
                React.createElement(
                    'p',
                    { className: 'friend-id', id: friend[0] },
                    'UserID #',
                    friend[0]
                )
            ),
            React.createElement(
                'button',
                { className: 'remove-friend', onClick: function onClick() {
                        return removeFriend(friend[0]);
                    } },
                'Remove'
            )
        ));
    };

    for (var i = 0; i < data.length; i++) {
        _loop(i);
    }

    return React.createElement(
        'div',
        null,
        friends
    );
}

function displayFriends(data) {
    var domContainer = document.getElementById('friends-container');
    var root = createRoot(domContainer);

    root.render(React.createElement(Friends, { data: data }));
}

window.displayFriends = displayFriends;