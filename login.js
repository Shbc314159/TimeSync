const form = document.getElementById('signup-form');
form.addEventListener('submit', function(event) {
    event.preventDefault();

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
    }
};