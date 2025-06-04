const {google} = require('googleapis');
const fs = require('fs');

// セキュアなトークン取得・更新スクリプト
// 本番環境では絶対にトークンをログに出力しない

async function secureTokenRefresh() {
    const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER;
    const tokenStr = process.env.G_TOKEN_OFFICE;
    
    if (!credentialsStr || !tokenStr) {
        console.error('❌ Required environment variables not found');
        return;
    }
    
    try {
        const credentials = JSON.parse(credentialsStr);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        const token = JSON.parse(tokenStr);
        oAuth2Client.setCredentials(token);
        
        console.log('🔄 Attempting token refresh...');
        
        // トークンを更新
        const {credentials: newToken} = await oAuth2Client.refreshAccessToken();
        
        console.log('✅ Token refreshed successfully');
        console.log('📝 Please update your .env file with the new token');
        console.log('⚠️  For security reasons, the token is saved to a secure file instead of being displayed');
        
        // セキュアファイルに保存（ログには出力しない）
        const secureTokenData = {
            ...token,
            access_token: newToken.access_token,
            expiry_date: newToken.expiry_date,
            updated_at: new Date().toISOString()
        };
        
        // セキュアなファイルに保存
        fs.writeFileSync('.secure_token_backup.json', JSON.stringify(secureTokenData, null, 2));
        console.log('💾 New token saved to .secure_token_backup.json');
        console.log('📋 Copy the content to update your environment variables');
        
    } catch (error) {
        console.log('❌ Token refresh failed:', error.message);
        console.log('💡 You may need to generate a new token: npm run generate-token');
    }
}

if (require.main === module) {
    secureTokenRefresh().catch(console.error);
}

module.exports = secureTokenRefresh;
