const {google} = require('googleapis');
const tokenAuth = require('../libs/tokenAuth');

async function checkPlaylistSettings() {
    const credentialsStr = process.env.YOUTUBE_DS_CREDENTIALS;
    const tokenStr = process.env.YOUTUBE_POS_TOKEN; // 授業用チャンネルのトークン
    const playlistId = process.env.YT_WS_PLAYLIST_ID;
    
    if (!credentialsStr || !tokenStr || !playlistId) {
        console.log('❌ 必要な環境変数が設定されていません');
        console.log('   YOUTUBE_DS_CREDENTIALS, YOUTUBE_POS_TOKEN, YT_WS_PLAYLIST_ID');
        return;
    }
    
    try {
        const auth = tokenAuth(credentialsStr, tokenStr);
        const youtube = google.youtube({version: 'v3', auth});
        
        console.log('🔍 プレイリスト設定を確認しています...');
        console.log('');
        
        // プレイリスト情報を取得
        const playlistResponse = await youtube.playlists.list({
            part: 'snippet,status',
            id: playlistId
        });
        
        if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
            console.log('❌ プレイリストが見つかりません');
            console.log(`   プレイリストID: ${playlistId}`);
            return;
        }
        
        const playlist = playlistResponse.data.items[0];
        console.log('📋 プレイリスト情報:');
        console.log(`   タイトル: ${playlist.snippet.title}`);
        console.log(`   ID: ${playlist.id}`);
        console.log(`   プライバシー: ${playlist.status.privacyStatus}`);
        console.log(`   説明: ${playlist.snippet.description || '(なし)'}`);
        console.log('');
        
        // プレイリストアイテムを少し取得してテスト
        try {
            const itemsResponse = await youtube.playlistItems.list({
                part: 'snippet',
                playlistId: playlistId,
                maxResults: 1
            });
            
            console.log('✅ プレイリストアイテムの取得: 成功');
            console.log(`   現在のアイテム数: ${itemsResponse.data.pageInfo.totalResults}件`);
            
        } catch (itemsError) {
            console.log('❌ プレイリストアイテムの取得: 失敗');
            console.log(`   エラー: ${itemsError.message}`);
        }
        
        console.log('');
        console.log('🔧 プレイリスト設定の確認方法:');
        console.log('1. YouTube Studio (https://studio.youtube.com) にアクセス');
        console.log('2. 左メニューから「プレイリスト」を選択');
        console.log(`3. 対象プレイリスト「${playlist.snippet.title}」を選択`);
        console.log('4. 右上の「⋮」メニューから「プレイリストの設定」を選択');
        console.log('5. 「並び順」が「手動」になっていることを確認');
        console.log('');
        console.log('💡 並び順が「手動」でない場合:');
        console.log('   - 「手動」に変更してください');
        console.log('   - 他の選択肢（「追加日時」「公開日時」など）だとposition指定ができません');
        
    } catch (error) {
        console.log('❌ プレイリスト設定の確認に失敗しました');
        console.log(`   エラー: ${error.message}`);
        
        if (error.code === 404) {
            console.log('💡 プレイリストが見つかりません。プレイリストIDを確認してください');
        } else if (error.code === 403) {
            console.log('💡 アクセス権限がありません。トークンのスコープを確認してください');
        }
    }
}

// テスト用: 新しいアイテムをプレイリストに追加してみる
async function testPlaylistAdd(videoId = 'dQw4w9WgXcQ') { // Rick Rollのテスト動画ID
    const credentialsStr = process.env.YOUTUBE_DS_CREDENTIALS;
    const tokenStr = process.env.YOUTUBE_POS_TOKEN;
    const playlistId = process.env.YT_WS_PLAYLIST_ID;
    
    if (!credentialsStr || !tokenStr || !playlistId) {
        console.log('❌ 必要な環境変数が設定されていません');
        return;
    }
    
    try {
        const auth = tokenAuth(credentialsStr, tokenStr);
        const youtube = google.youtube({version: 'v3', auth});
        
        console.log('🧪 プレイリスト追加のテストを実行します...');
        console.log(`   テスト動画ID: ${videoId}`);
        console.log(`   プレイリストID: ${playlistId}`);
        console.log('');
        
        const playListEditOptions = {
            part: 'snippet',
            requestBody: {
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        videoId: videoId,
                        kind: 'youtube#video'
                    },
                },
            }
        };
        
        const response = await youtube.playlistItems.insert(playListEditOptions);
        console.log('✅ テスト成功: プレイリストに動画を追加できました');
        console.log(`   追加されたアイテムID: ${response.data.id}`);
        
        // テスト用に追加した動画を削除
        await youtube.playlistItems.delete({
            id: response.data.id
        });
        console.log('🗑️  テスト動画を削除しました');
        
    } catch (error) {
        console.log('❌ テスト失敗: プレイリストに動画を追加できませんでした');
        console.log(`   エラー: ${error.message}`);
        
        if (error.message.includes('manual sorting')) {
            console.log('');
            console.log('💡 このエラーの解決方法:');
            console.log('   YouTube Studio でプレイリストの並び順を「手動」に変更してください');
        }
    }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('📖 プレイリスト設定確認ツール');
    console.log('');
    console.log('使用方法:');
    console.log('  npm run check-playlist');
    console.log('  node tokentools/checkPlaylist.js');
    console.log('  node tokentools/checkPlaylist.js --test [動画ID]');
    console.log('');
    console.log('オプション:');
    console.log('  --test [動画ID]    プレイリスト追加のテスト実行');
    console.log('                     動画IDを省略した場合はデフォルトのテスト動画を使用');
    console.log('');
    process.exit(0);
}

if (args.includes('--test')) {
    const videoId = args[args.indexOf('--test') + 1] || 'dQw4w9WgXcQ';
    testPlaylistAdd(videoId).catch(console.error);
} else {
    checkPlaylistSettings().catch(console.error);
}
