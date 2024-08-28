async function startlogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userid = await login(username, password);
    if (userid != null) {
        setSessionCookie('userid', userid);
        window.location.pathname = "/calendar.html"; 
    }
}

async function login(username, password) {
    const response = await fetch('/login', {
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
        if (errorData.error.includes('Invalid credentials')) {
            alert('The details you provided are incorrect.');
        } else {
            alert('Error logging in user:', errorData.error);
        }
        return null;
    };

    const data = await response.json();
    return data.id;  
};