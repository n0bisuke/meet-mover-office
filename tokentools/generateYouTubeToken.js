const {google} = require('googleapis');
const readline = require('readline');

const YOUTUBE_SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl'
];

async function generateYouTubeToken() {
    const credentialsStr = process.env.YOUTUBE_DS_CREDENTIALS;
    
    if (!credentialsStr) {
        console.error('❌ YOUTUBE_DS_CREDENTIALS environment variable not found');
        console.log('💡 YouTube用のクレデンシャルを設定してください');
        return;
    }
    
    try {
        const credentials = JSON.parse(credentialsStr);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: YOUTUBE_SCOPES,
            prompt: 'consent' // 常に新しいリフレッシュトークンを取得
        });
        
        console.log('🎬 YouTube API用トークンを生成します');
        console.log('');
        console.log('📋 以下の手順でトークンを取得してください:');
        console.log('1. 下記URLにアクセス');
        console.log('2. YouTubeチャンネルを持つGoogleアカウントでログイン');
        console.log('3. アプリケーションへのアクセスを許可');
        console.log('4. 表示される認証コードをコピー');
        console.log('');
        console.log('🔗 認証URL:');
        console.log(authUrl);
        console.log('');
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        
        rl.question('📝 認証コードを入力してください: ', async (code) => {
            rl.close();
            
            try {
                const {tokens} = await oAuth2Client.getToken(code);
                
                console.log('');
                console.log('✅ YouTubeトークンが正常に取得されました！');
                console.log('');
                console.log('=== トークン詳細 ===');
                console.log(JSON.stringify(tokens, null, 2));
                console.log('');
                console.log('=== 環境変数用（1行形式） ===');
                console.log('YOUTUBE_CUSTOM_TOKEN=' + JSON.stringify(tokens));
                console.log('');
                console.log('💡 このトークンを以下に設定してください:');
                console.log('  - ローカル: .env ファイル');
                console.log('  - GitHub: Repository Settings > Secrets and variables > Actions');
                console.log('');
                
                // チャンネル情報も取得してみる
                try {
                    oAuth2Client.setCredentials(tokens);
                    const youtube = google.youtube({version: 'v3', auth: oAuth2Client});
                    const channelResponse = await youtube.channels.list({
                        part: 'snippet',
                        mine: true
                    });
                    
                    if (channelResponse.data.items && channelResponse.data.items.length > 0) {
                        const channel = channelResponse.data.items[0];
                        console.log('📺 関連付けられたYouTubeチャンネル:');
                        console.log(`   チャンネル名: ${channel.snippet.title}`);
                        console.log(`   チャンネルID: ${channel.id}`);
                        console.log('');
                    }
                } catch (channelError) {
                    console.log('⚠️  チャンネル情報の取得に失敗しましたが、トークンは有効です');
                }
                
            } catch (error) {
                console.error('❌ トークンの取得に失敗しました:', error.message);
                if (error.message.includes('invalid_grant')) {
                    console.log('💡 認証コードが間違っているか、期限切れの可能性があります');
                    console.log('   再度認証URLにアクセスして新しいコードを取得してください');
                }
            }
        });
        
    } catch (parseError) {
        console.error('❌ クレデンシャルのパースに失敗しました:', parseError.message);
        console.log('💡 YOUTUBE_DS_CREDENTIALS の形式を確認してください');
    }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log('📖 YouTube トークン生成ツール');
    console.log('');
    console.log('使用方法:');
    console.log('  npm run generate-youtube-token');
    console.log('  node tokentools/generateYouTubeToken.js');
    console.log('');
    console.log('必要な環境変数:');
    console.log('  YOUTUBE_DS_CREDENTIALS - YouTube API用のクレデンシャル（JSON形式）');
    console.log('');
    process.exit(0);
}

generateYouTubeToken().catch(console.error);
