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
            console.log('🔄 New refresh token received');
        }
        if (tokens.access_token) {
            console.log('✅ Access token refreshed successfully');
            
            // 新しいトークンを現在のトークンにマージ
            const updatedToken = {
                ...token,
                access_token: tokens.access_token,
                expiry_date: tokens.expiry_date
            };
            
            // 環境変数として使用できる形で出力（ログに記録）
            console.log('Updated token for env:', JSON.stringify(updatedToken));
        }
    });
    
    return oAuth2Client;
}
