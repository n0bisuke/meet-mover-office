
'use strict';

const fs = require('node:fs');
const readline = require('readline');
const tokenAuth = require('./tokenAuth');
const {google} = require('googleapis');

const credentials = process.env.YOUTUBE_DS_CREDENTIALS;
const YT_WS_PLAYLIST_ID = process.env.YT_WS_PLAYLIST_ID;

const _ytUpRouter = async (params) => {
  let token = '';

  //backup or school
  if(params.channel === 'backup') {
    token = process.env.YOUTUBE_POS_BACKUP_TOKEN; // backupチャンネルへ
    // console.log('バックアップチャンネルへアップロードします', token, typeof token);
    console.log('バックアップチャンネルへアップロードします');
    // token = process.env.YOUTUBE_POS_BACKUP_TOKEN_SUB // backupチャンネルへ
  }else if(params.channel === 'school'){
    token = process.env.YOUTUBE_POS_TOKEN; // POSチャンネルへ
    // console.log('授業動画チャンネルへアップロードします', token, typeof token);
    console.log('授業動画チャンネルへアップロードします');
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
      if(uploadOptions.channel === 'school') {
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
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`${Math.round(progress)}% complete`);
          },
        }
      );
      console.log('\n\n');

      //アップロード後、授業動画以外は
      if(uploadOptions.channel !== 'school') {
        console.log('アップロード完了: 授業動画ではないのでリスト追加はしない');
        return {
          type: 'backup', //バックアップ動画の予定
          status: 'ytUploadDone',
          msg: 'アップロード完了: 授業動画ではないのでリスト追加はしない',
        };
      }

      // console.log(uploadedVideo.data);

      //2. 非公開作業リストに追加
      console.log('WS再生リストに追加...');
      const playListEditOptions = {
        part: 'id,snippet,contentDetails',
        requestBody: {
          snippet: {
            playlistId: YT_WS_PLAYLIST_ID,
            position: 0,
            resourceId: {
              videoId: uploadedVideo.data.id,
              kind: 'youtube#video'
            },
          },
        }
      }

      const res = await youtube.playlistItems.insert(playListEditOptions);
      // console.log(res.data);
      // return uploadedVideo.data;
      return {
        type: 'school', //授業動画の予定
        status: 'ytUploadDone',
        msg: 'アップロード完了: 授業動画でリストも追加',
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