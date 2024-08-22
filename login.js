async function startsignup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userid = signup(username, password);
    if (userid != null) {
        setSessionCookie('userid', userid);
        console.log(getCookie('userid'));
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
    })

    if (response.ok) { 
        const data = await response.json();
        console.log('User registered successfully:', data);
        return data.id;
    } else {
        const errorData = await response.json();
        console.log(errorData.error);
        if (errorData.error.includes('duplicate key value violates unique constraint')) {
            alert('That password is already taken. Please choose a different one.');
        }
    }
};