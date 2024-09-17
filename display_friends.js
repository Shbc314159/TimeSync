function FriendRequests(_ref) {
    var data = _ref.data;

    var requests = data.map(function (request) {
        return React.createElement(
            "div",
            { key: request.id, className: "request-container" },
            React.createElement(
                "div",
                { className: "requesterInfo" },
                React.createElement(
                    "p",
                    { className: "request-text" },
                    React.createElement(
                        "span",
                        { style: { fontWeight: "550", fontSize: "20px" } },
                        request.username
                    ),
                    " wants to connect"
                ),
                React.createElement(
                    "p",
                    { className: "request-id" },
                    "#",
                    request.id
                )
            ),
            React.createElement(
                "button",
                { className: "accept-request", onClick: function onClick() {
                        return acceptRequest(request.id);
                    } },
                "Accept"
            ),
            React.createElement(
                "button",
                { className: "reject-request", onClick: function onClick() {
                        return declineRequest(request.id);
                    } },
                "Decline"
            )
        );
    });

    return React.createElement(
        "div",
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