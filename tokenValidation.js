const {google} = require('googleapis');

async function checkTokenValidity(credentialsStr, tokenStr) {
    if (!credentialsStr || !tokenStr) {
        console.error('❌ Required environment variables not found');
        return false;
    }
    
    try {
        const token = JSON.parse(tokenStr);
        const currentTime = Date.now();
        const isExpired = currentTime > token.expiry_date;
        
        console.log('🔍 Token expiry check:');
        console.log('  Token expiry:', new Date(token.expiry_date));
        console.log('  Current time:', new Date(currentTime));
        console.log('  Is expired:', isExpired);
        
        if (isExpired) {
            console.log('⚠️  Access token is expired, but refresh token will be used automatically');
        }
        
        const credentials = JSON.parse(credentialsStr);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        oAuth2Client.setCredentials(token);
        
        // Drive API を使ってトークンの有効性をテスト
        const drive = google.drive({version: 'v3', auth: oAuth2Client});
        const response = await drive.about.get({fields: 'user'});
        
        console.log('✅ Token is valid, authenticated as:', response.data.user.displayName);
        return true;
        
    } catch (error) {
        console.log('❌ Token validation failed:', error.message);
        
        if (error.code === 401) {
            console.log('💡 Please run: npm run generate-token');
        }
        
        return false;
    }
}

module.exports = { checkTokenValidity };
