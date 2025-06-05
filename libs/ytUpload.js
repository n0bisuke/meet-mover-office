
'use strict';

const fs = require('node:fs');
// const readline = require('readline');
const tokenAuth = require('./tokenAuth');
const {google} = require('googleapis');

const credentials = process.env.YOUTUBE_DS_CREDENTIALS;
const YT_WS_PLAYLIST_ID = process.env.YT_WS_PLAYLIST_ID;
const YT_HONKA_PLAYLIST_ID = process.env.YT_HONKA_PLAYLIST_ID;
const YT_FKI_PLAYLIST_ID = process.env.YT_FKI_PLAYLIST_ID;

//こんな形式でNotionから取得するようにしたい。
const YTPLAYLISTS = [
  {
    name: `本科11期`,
    roomid:  '',
    yt_playlist_id: YT_HONKA_PLAYLIST_ID //https://www.youtube.com/playlist?list=xxxxxxx
  },
  {

  }
]

const _ytUpRouter = async (params) => {
  let token = '';

  //backup, school, custom のチャンネル振り分け
  if(params.channel === 'backup') {
    token = process.env.YOUTUBE_POS_BACKUP_TOKEN; // backupチャンネルへ
    console.log('バックアップチャンネルへアップロードします');
  } else if(params.channel === 'school'){
    token = process.env.YOUTUBE_POS_TOKEN; // POSチャンネルへ
    console.log('授業動画チャンネルへアップロードします');
  } else if(params.channel === 'custom'){
    token = process.env.YOUTUBE_CUSTOM2_TOKEN; // カスタムチャンネルへ
    console.log('カスタムチャンネルへアップロードします');
  } else if(params.channel === 'honka' || params.channel === 'fki'){
    token = process.env.YOUTUBE_CUSTOM_TOKEN; // カスタムチャンネル2へ
    console.log('カスタムチャンネル2へアップロードします');
  } else {
    // デフォルトはbackupチャンネル
    token = process.env.YOUTUBE_POS_BACKUP_TOKEN;
    console.log('デフォルト（バックアップ）チャンネルへアップロードします');
  }
  
  const auth = tokenAuth(credentials, token);
  const youtube = google.youtube({version: 'v3', auth});

  return youtube;
}

const youtubeUpload = async (uploadOptions) => {

  //チャンネルのアップロード先を決める
  const youtube = await _ytUpRouter(uploadOptions);
  // console.log(uploadOptions);

  try {
      const fileName = uploadOptions.MOVIE_PATH; //アップロードする動画ファイル名

      //テキストファイルはスキップ
      if(fileName.indexOf('.txt') != -1) return;
      const fileSize = fs.statSync(fileName).size;

      //授業動画の場合は限定公開にする
      if(uploadOptions.channel === 'school' || uploadOptions.channel === 'honka' || uploadOptions.channel === 'fki') {
        // uploadOptions.status = 'private'; //非公開にする
        uploadOptions.status = 'unlisted'; //限定公開にする
        // uploadOptions.status = 'public'; //公開にする
      }

      //1. 動画アップロードのメイン処理
      const uploadedVideo = await youtube.videos.insert({
          part: 'id,snippet,status',
          notifySubscribers: false,
          requestBody: {
            snippet: {
              title: uploadOptions.title,
              description: uploadOptions.description,
            },
            status: {
              privacyStatus: uploadOptions.status,
            },
          },
          media: {
            body: fs.createReadStream(fileName),
          },
        },
        {
          // Use the `onUploadProgress` event from Axios to track the
          // number of bytes uploaded to this point.
          onUploadProgress: evt => {
            const progress = (evt.bytesRead / fileSize) * 100;

            if (process.stdout.isTTY) {
              //ローカルの場合はこちら
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write(`${Math.round(progress)}% complete`);
            }else{
              //GitHub Actionsの場合はこちら
              process.stdout.write('.')
              if(Math.round(progress) >= 100){
                console.log('アップロード完了');
              }
            }

          },
        }
      );
      console.log('\n\n');

      //アップロード後、授業動画以外は
      if(uploadOptions.channel !== 'school' && uploadOptions.channel !== 'honka' && uploadOptions.channel !== 'fki') {
        console.log('アップロード完了: 授業動画ではないのでリスト追加はしない');
        return {
          type: 'backup', //バックアップ動画の予定
          status: 'ytUploadDone',
          msg: 'アップロード完了: 授業動画ではないのでリスト追加はしない',
        };
      }

      //2. 非公開作業リストに追加
      console.log('WS再生リストに追加...');

      // console.log(uploadedVideo.data);
      let playlistId = YT_WS_PLAYLIST_ID; //WSの動画リストID
      if(uploadOptions.channel === 'honka') {
        //本科動画の場合は本科のリストに追加
        playlistId = YT_HONKA_PLAYLIST_ID;
        console.log('本科動画リストに追加...');
      } else if(uploadOptions.channel === 'fki') {
        //FKI動画の場合はFKIのリストに追加
        playlistId = YT_FKI_PLAYLIST_ID;
        console.log('FKI動画リストに追加...');
      }

      let playlistResult = 'リスト追加成功';
      
      try {
        const playListEditOptions = {
          part: 'snippet',
          requestBody: {
            snippet: {
              playlistId: playlistId,
              resourceId: {
                videoId: uploadedVideo.data.id,
                kind: 'youtube#video'
              },
            },
          }
        }

        const res = await youtube.playlistItems.insert(playListEditOptions);
        console.log('プレイリスト追加完了');
        
      } catch (playlistError) {
        console.log('⚠️  プレイリスト追加失敗:', playlistError.message);
        
        if (playlistError.message.includes('manual sorting')) {
          console.log('💡 プレイリストが手動ソートに設定されていません');
          console.log('   YouTube Studio > プレイリスト設定 > 並び順を「手動」に変更してください');
        }
        
        playlistResult = 'リスト追加失敗（アップロードは成功）';
      }
      
      return {
        type: 'school', //授業動画の予定
        status: 'ytUploadDone',
        msg: `アップロード完了: 授業動画 - ${playlistResult}`,
      };

  } catch (error) {
      console.log('The API returned an error: ' + error);
      return {
        type: 'error',
        status: 'ytUploadError',
        msg: 'The API returned an error: ' + error,
      }
  }

}

module.exports = youtubeUpload;