const { SMART_PROPERTIES_API, SMART_PROPERTIES_API_V2 } = require("../helpers/constants")

const smartPropertiesSignin =  (tenant, email, password) => 
        callPost(`${SMART_PROPERTIES_API}/${tenant}/auth/signin`, { email, password });
const smartPropertiesLogout =  (tenant) => 
        callPost(`${SMART_PROPERTIES_API}/${tenant}/auth/logout`);

const smartPropertiesTenantAll = () => 
        call(`${SMART_PROPERTIES_API}/tenant`);
const smartPropertiesTenantSave = (identifier, name, icon) => 
        callPost(`${SMART_PROPERTIES_API}/tenant`, { identifier, name, icon });
const smartPropertiesTenantUpdate = (identifier, name, icon) => 
        callPut(`${SMART_PROPERTIES_API}/tenant`, { identifier, name, icon });
const smartPropertiesTenantGetByIdentifier = (identifier) => 
        call(`${SMART_PROPERTIES_API}/tenant/${identifier}`);
const smartPropertiesTenantDeleteByIdentifier = (identifier) => 
        callDelete(`${SMART_PROPERTIES_API}/tenant/${identifier}`);

const smartPropertiesUserAll = (tenant) => 
        call(`${SMART_PROPERTIES_API}/${tenant}/user`);
const smartPropertiesUserSave = (tenant, email, name, rol, icon) => 
        callPost(`${SMART_PROPERTIES_API}/${tenant}/user`, { email, name, rol, icon });
const smartPropertiesUserUpdate = (tenant, email, name, rol, icon) => 
        callPut(`${SMART_PROPERTIES_API}/${tenant}/user`, { email, name, rol, icon });
const smartPropertiesUserGetByIdentifier = (tenant, identifier) => 
        call(`${SMART_PROPERTIES_API}/${tenant}/user/${identifier}`);
const smartPropertiesUserDeleteByIdentifier = (tenant, identifier) => 
        callDelete(`${SMART_PROPERTIES_API}/${tenant}/user/${identifier}`);

const smartPropertiesWorkspaceAll = (tenant) => 
        call(`${SMART_PROPERTIES_API}/${tenant}/workspace`);
const smartPropertiesWorkspaceSave = (tenant, identifier, name, icon, refreshUrl) => 
        callPost(`${SMART_PROPERTIES_API}/${tenant}/workspace`, { identifier, name, icon, refreshUrl});
const smartPropertiesWorkspaceUpdate = (tenant, identifier, name, icon, refreshUrl) => 
        callPut(`${SMART_PROPERTIES_API}/${tenant}/workspace`, { identifier, name, icon, refreshUrl});
const smartPropertiesWorkspaceGetByIdentifier = (tenant, identifier) => 
        call(`${SMART_PROPERTIES_API}/${tenant}/workspace/${identifier}`);
const smartPropertiesWorkspaceDeleteByIdentifier = (tenant, identifier) => 
        callDelete(`${SMART_PROPERTIES_API}/${tenant}/workspace/${identifier}`);
const smartPropertiesWorkspaceCreateApiToken = (tenant, identifier) => 
        call(`${SMART_PROPERTIES_API}/${tenant}/workspace/${identifier}/create-api-token`);

const smartPropertiesSmartPropertySave = (tenant, workpace, smartProperty) => 
        callPost(`${SMART_PROPERTIES_API_V2}/${tenant}/smart-property/${workpace}`, smartProperty);
const smartPropertiesSmartPropertyUpdate = (tenant, workpace, smartProperty) => 
        callPut(`${SMART_PROPERTIES_API_V2}/${tenant}/smart-property/${workpace}`, smartProperty);
const smartPropertiesSmartPropertyByIdentifier = (tenant, workpace, identifier) => 
        call(`${SMART_PROPERTIES_API_V2}/${tenant}/smart-property/${workpace}/${identifier}`);
const smartPropertiesSmartPropertyDeleteByIdentifier = (tenant, workpace, identifier) => 
        callDelete(`${SMART_PROPERTIES_API_V2}/${tenant}/smart-property/${workpace}/${identifier}`);

const smartPropertiesCodeAll = (tenant, workpace) => 
        call(`${SMART_PROPERTIES_API_V2}/${tenant}/smart-property-code/${workpace}`);
const smartPropertiesCodeByIdentifierAll = (tenant, workpace, identifier) => 
        call(`${SMART_PROPERTIES_API_V2}/${tenant}/smart-property-code/${workpace}/${identifier}`);
const smartPropertiesKeysAll = (tenant, workpace) => 
        call(`${SMART_PROPERTIES_API_V2}/${tenant}/smart-property-key/${workpace}`);
const smartPropertiesAiExplainCode = (tenant, code) => 
        callPost(`${SMART_PROPERTIES_API_V2}/${tenant}/ai/explain-code`, { code });
const smartPropertiesAiGenerateTestCases = (tenant, code) => 
        callPost(`${SMART_PROPERTIES_API_V2}/${tenant}/ai/generate-test-cases`, { code });
const smartPropertiesAiGenerateCode = (tenant, description) => 
        callPost(`${SMART_PROPERTIES_API_V2}/${tenant}/ai/generate-code`, { description });
const smartPropertiesAiUpdateCode = (tenant, code, update) => 
        callPost(`${SMART_PROPERTIES_API_V2}/${tenant}/ai/update-code`, { code, update });

const callPut = (url, request, noCredentials) => {
    return call(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    }, noCredentials);
}

const callPost = (url, request, noCredentials) => {
    return call(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    }, noCredentials);
}

const callDelete = (url, noCredentials) => {
    return call(url, {
        method: "DELETE"
    }, noCredentials);
}

const call = (url, request, noCredentials) => {
    if(!request) request = {};
    if(!noCredentials) request['credentials'] = 'include';
    return fetch(url, request)
        .then((res) => Promise.all([res.status, res.text()]))
        .then(([status, text]) => Promise.all([status, (text ? JSON.parse(text) : {})]));
}

module.exports = {
    smartPropertiesSignin,
    smartPropertiesLogout,
    smartPropertiesTenantAll,
    smartPropertiesTenantSave,
    smartPropertiesTenantUpdate,
    smartPropertiesTenantGetByIdentifier,
    smartPropertiesTenantDeleteByIdentifier,
    smartPropertiesUserAll,
    smartPropertiesUserSave,
    smartPropertiesUserUpdate,
    smartPropertiesUserGetByIdentifier,
    smartPropertiesUserDeleteByIdentifier,
    smartPropertiesWorkspaceAll,
    smartPropertiesWorkspaceSave,
    smartPropertiesWorkspaceUpdate,
    smartPropertiesWorkspaceGetByIdentifier,
    smartPropertiesWorkspaceDeleteByIdentifier,
    smartPropertiesWorkspaceCreateApiToken,
    smartPropertiesSmartPropertySave,
    smartPropertiesSmartPropertyUpdate,
    smartPropertiesSmartPropertyByIdentifier,
    smartPropertiesSmartPropertyDeleteByIdentifier,
    smartPropertiesCodeAll,
    smartPropertiesCodeByIdentifierAll,
    smartPropertiesKeysAll,
    smartPropertiesAiExplainCode,
    smartPropertiesAiGenerateTestCases,
    smartPropertiesAiGenerateCode,
    smartPropertiesAiUpdateCode
}