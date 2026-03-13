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
    sessionStorage.setItem("tenantName", data.tenantName);
}

const removeSessionData = () => {
    Cookies.remove('userId');
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userIcon");
    sessionStorage.removeItem("userRol");
    sessionStorage.removeItem("tenantName");
}

module.exports = {
    isLoggedIn,
    setUserSessionData,
    removeSessionData
}