const {google} = require('googleapis');
const readline = require('readline');

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
];

async function generateNewToken() {
    const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER;
    
    if (!credentialsStr) {
        console.error('G_CREDENTIALS_GDRIVE_MOVER environment variable not found');
        return;
    }
    
    const credentials = JSON.parse(credentialsStr);
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    
    console.log('以下のURLにアクセスして認証してください:');
    console.log(authUrl);
    console.log('');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    rl.question('認証コードを入力してください: ', async (code) => {
        rl.close();
        
        try {
            const {tokens} = await oAuth2Client.getToken(code);
            console.log('\n=== 新しいトークンが取得されました ===');
            console.log(JSON.stringify(tokens, null, 2));
            console.log('\n=== 環境変数用（1行） ===');
            console.log('G_TOKEN_OFFICE=' + JSON.stringify(tokens));
            
        } catch (error) {
            console.error('トークンの取得に失敗しました:', error);
        }
    });
}

generateNewToken().catch(console.error);
