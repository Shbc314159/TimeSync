function startsignup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userid = signup(username, password);
    console.log(userid);
    if (userid != null) {
        setSessionCookie('userid', userid);
        console.log(getCookie('userid'));
    }
}

function signup(username, password) {
    return fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            username: username, 
            password: password 
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                if (errorData.error && errorData.error.includes('duplicate key value violates unique constraint')) {
                    alert('That username is already taken. Please choose a different one.');
                } else {
                    alert('Error registering user:', errorData.error);
                }
                return null;
            });
        }
        return response.json().then(data => {
            console.log('User registered successfully:', data);
            return data.id;
        });
    })
    .catch(error => {
        alert('Error registering user:', error);
        return null;
    });
};