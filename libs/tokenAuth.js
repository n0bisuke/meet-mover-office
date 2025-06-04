const {google} = require('googleapis');
const fs = require('fs');

module.exports = (credentialsStr, tokenStr) => {
    const credentials = JSON.parse(credentialsStr);
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    const token = JSON.parse(tokenStr);
    oAuth2Client.setCredentials(token);
    
    // トークンの自動更新設定
    oAuth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
            console.log('🔄 Refresh token updated');
        }
        if (tokens.access_token) {
            console.log('✅ Access token refreshed successfully');
            // セキュリティ上の理由でトークンの詳細はログに出力しない
            console.log('ℹ️  New token received - please update your environment variables manually if needed');
        }
    });
    
    return oAuth2Client;
}
