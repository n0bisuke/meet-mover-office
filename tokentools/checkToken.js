const {google} = require('googleapis');

async function checkTokenValidity() {
    console.log('=== Google Drive Token Validity Check ===');
    
    const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER;
    const tokenStr = process.env.G_TOKEN_OFFICE;
    
    if (!credentialsStr || !tokenStr) {
        console.error('❌ Required environment variables not found');
        return false;
    }
    
    try {
        const token = JSON.parse(tokenStr);
        console.log('Token expiry:', new Date(token.expiry_date));
        console.log('Current time:', new Date());
        console.log('Is expired:', Date.now() > token.expiry_date);
        
        const credentials = JSON.parse(credentialsStr);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        oAuth2Client.setCredentials(token);
        
        // Drive API を使ってトークンの有効性をテスト
        const drive = google.drive({version: 'v3', auth: oAuth2Client});
        const response = await drive.about.get({fields: 'user'});
        
        console.log('✅ トークンは有効です');
        console.log('User:', response.data.user.displayName);
        return true;
        
    } catch (error) {
        console.log('❌ トークンが無効です:', error.message);
        
        if (error.code === 401) {
            console.log('🔄 リフレッシュトークンでの更新を試行します...');
            return await refreshToken();
        }
        
        return false;
    }
}

async function refreshToken() {
    try {
        const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER;
        const tokenStr = process.env.G_TOKEN_OFFICE;
        
        const credentials = JSON.parse(credentialsStr);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        const token = JSON.parse(tokenStr);
        oAuth2Client.setCredentials(token);
        
        // トークンを更新
        const {credentials: newToken} = await oAuth2Client.refreshAccessToken();
        
        console.log('✅ トークンが正常に更新されました');
        console.log('\n=== 新しいトークン（環境変数用） ===');
        console.log('G_TOKEN_OFFICE=' + JSON.stringify(newToken));
        
        return true;
        
    } catch (error) {
        console.log('❌ トークンの更新に失敗しました:', error.message);
        console.log('💡 新しいトークンの取得が必要です。以下を実行してください:');
        console.log('   node --env-file=.env generateToken.js');
        return false;
    }
}

checkTokenValidity().catch(console.error);
