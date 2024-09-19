function setSessionCookie(name, value) {
    document.cookie = name + "=" + value + ";path=/";
}

function setSessionCookie2dArr(name, value) {
    const stringValue = JSON.stringify(value);
    const encodedValue = encodeURIComponent(stringValue);
    document.cookie = name + "=" + encodedValue + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) === 0) {
            if (name == 'year' || name == 'month' || name == 'userid') {
                return parseInt(cookie.substring(nameEQ.length, cookie.length));
            }
            if (name == 'friends') {
                return JSON.parse(decodeURIComponent(cookie.substring(nameEQ.length, cookie.length)));
            }
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }

    return null;
}

function checkLogin() {
    if (getCookie('userid') == null && window.location.pathname != '/login.html') {
        window.location.pathname = "/login.html";
    }
}

