const Cookies = require('js-cookie');

const isLoggedIn = () => {
    return true && Cookies.get("userId") 
}

const setUserSessionData = (data) => {
    Cookies.set('userId', data.userId, { expires: 1 });
    sessionStorage.setItem("userName", data.userName);
    sessionStorage.setItem("userEmail", data.userEmail);
    sessionStorage.setItem("userIcon", data.userIcon);
    sessionStorage.setItem("userRol", data.userRol);
}

const removeSessionData = () => {
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userIcon");
    sessionStorage.removeItem("userRol");
}

module.exports = {
    isLoggedIn,
    setUserSessionData,
    removeSessionData
}