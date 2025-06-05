const {google} = require('googleapis');

async function checkYouTubeToken(tokenEnvVar, tokenName) {
    const tokenStr = process.env[tokenEnvVar];
    const credentialsStr = process.env.YOUTUBE_DS_CREDENTIALS;
    
    if (!tokenStr) {
        console.log(`❌ ${tokenName}: 環境変数 ${tokenEnvVar} が見つかりません`);
        return false;
    }
    
    if (!credentialsStr) {
        console.log(`❌ YOUTUBE_DS_CREDENTIALS が見つかりません`);
        return false;
    }
    
    try {
        const token = JSON.parse(tokenStr);
        const credentials = JSON.parse(credentialsStr);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token);
        
        const youtube = google.youtube({version: 'v3', auth: oAuth2Client});
        
        // チャンネル情報を取得してトークンの有効性をテスト
        const response = await youtube.channels.list({
            part: 'snippet',
            mine: true
        });
        
        if (response.data.items && response.data.items.length > 0) {
            const channel = response.data.items[0];
            console.log(`✅ ${tokenName}: 有効`);
            console.log(`   チャンネル: ${channel.snippet.title}`);
            console.log(`   チャンネルID: ${channel.id}`);
            
            // トークンの期限チェック
            if (token.expiry_date) {
                const currentTime = Date.now();
                const isExpired = currentTime > token.expiry_date;
                const expiryDate = new Date(token.expiry_date);
                
                console.log(`   期限: ${expiryDate.toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})} (${isExpired ? '期限切れ' : '有効'})`);
                
                if (isExpired) {
                    console.log(`   ⚠️  アクセストークンは期限切れですが、リフレッシュトークンで自動更新されます`);
                }
            }
            
            return true;
        } else {
            console.log(`❌ ${tokenName}: チャンネルが見つかりません`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ ${tokenName}: エラー - ${error.message}`);
        
        if (error.code === 401) {
            console.log(`   💡 トークンが無効です。npm run generate-youtube-token で新しいトークンを生成してください`);
        } else if (error.code === 403) {
            console.log(`   💡 YouTube API の権限が不足しています`);
        }
        
        return false;
    }
}

async function checkAllYouTubeTokens() {
    console.log('🎬 YouTube トークンの有効性をチェックしています...');
    console.log('');
    
    const tokens = [
        ['YOUTUBE_POS_TOKEN', '授業用チャンネル'],
        ['YOUTUBE_POS_BACKUP_TOKEN', 'バックアップチャンネル'],
        ['YOUTUBE_CUSTOM_TOKEN', 'カスタムチャンネル1'],
        ['YOUTUBE_CUSTOM2_TOKEN', 'カスタムチャンネル2'],
        ['YOUTUBE_POS_BACKUP_TOKEN_SUB', 'バックアップチャンネル(SUB)']
    ];
    
    let validCount = 0;
    const totalCount = tokens.length;
    
    for (const [envVar, name] of tokens) {
        const isValid = await checkYouTubeToken(envVar, name);
        if (isValid) validCount++;
        console.log('');
    }
    
    console.log('=== 結果 ===');
    console.log(`有効なトークン: ${validCount}/${totalCount}`);
    
    if (validCount === 0) {
        console.log('❌ 有効なYouTubeトークンがありません');
        console.log('💡 npm run generate-youtube-token でトークンを生成してください');
    } else if (validCount < totalCount) {
        console.log('⚠️  一部のトークンが無効です');
        console.log('💡 無効なトークンについては再生成を検討してください');
    } else {
        console.log('✅ すべてのYouTubeトークンが有効です');
    }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log('📖 YouTube トークン検証ツール');
    console.log('');
    console.log('使用方法:');
    console.log('  npm run check-youtube-token');
    console.log('  node tokentools/checkYouTubeToken.js');
    console.log('');
    console.log('チェックするトークン:');
    console.log('  - YOUTUBE_POS_TOKEN (授業用)');
    console.log('  - YOUTUBE_POS_BACKUP_TOKEN (バックアップ用)');
    console.log('  - YOUTUBE_CUSTOM_TOKEN (カスタム1)');
    console.log('  - YOUTUBE_CUSTOM2_TOKEN (カスタム2)');
    console.log('  - YOUTUBE_POS_BACKUP_TOKEN_SUB (バックアップSUB)');
    console.log('');
    process.exit(0);
}

checkAllYouTubeTokens().catch(console.error);
