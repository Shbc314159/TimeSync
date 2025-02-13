async function startsignup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username == null || password == null) {
        alert("Please fill in all fields.");
        return;
    }
    const userid = await signup(username, password);
    if (userid != null) {
        setSessionCookie('userid', userid);
        setSessionCookie('username', username);
        window.location.pathname = "/calendar.html";
    }
}

async function signup(username, password) {
    const response = await fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            username: username, 
            password: password 
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error.includes('duplicate key value violates unique constraint')) {
            alert('That username is already taken. Please choose a different one.');
        } else {
            alert('Error registering user:', errorData.error);
        }
        return null;
    };

    const data = await response.json();
    return data.id;  
};