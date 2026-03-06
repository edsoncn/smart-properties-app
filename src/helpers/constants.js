
module.exports = Object.freeze({
    SMART_PROPERTIES_API: process.env.REACT_APP_SMART_PROPERTIES_API ?? "http://localhost:3001/api/v1",
    SMART_PROPERTIES_API_V2: process.env.REACT_APP_SMART_PROPERTIES_API_V2 ?? "http://localhost:3001/api/v2",
    ROLES: {
        "super-admin" : "Super Administrator",
        "admin" : "Administrator",
        "operator" : "Operator",
        "tester" : "Tester"
    }
});