const form = document.getElementById('sign-up-form');
form.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    const userid = signup(data.username, data.password);
    setSessionCookie('userid', userid);
    console.log(getCookie('userid'));
});

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