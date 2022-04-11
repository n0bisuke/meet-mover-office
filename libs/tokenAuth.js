
const {google} = require('googleapis');

module.exports = (credentialsStr, tokenStr) => {
    const credentials = JSON.parse(credentialsStr);
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(JSON.parse(tokenStr));
    return oAuth2Client;
}
// const auth = tokenAuth();
