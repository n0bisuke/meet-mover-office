
'use strict';

const fs = require('fs');
const readline = require('readline');
const tokenAuth = require('./tokenAuth');
const {google} = require('googleapis');

const credentials = process.env.YOUTUBE_DS_CREDENTIALS;

const _ytUpRouter = async (params) => {
  let token = '';

  if(params.channel === 'backup') {
    // token = process.env.YOUTUBE_POS_BACKUP_TOKEN; // backupチャンネルへ
    token = process.env.YOUTUBE_POS_BACKUP_TOKEN_SUB // backupチャンネルへ
  }else if(params.channel === 'school'){
    token = process.env.YOUTUBE_POS_TOKEN; // POSチャンネルへ
  }
  
  const auth = tokenAuth(credentials, token);
  const youtube = google.youtube({version: 'v3', auth});

  return youtube;
}

const youtubeUpload = async params => {

  const youtube = await _ytUpRouter(params);

    try {
        const fileName = params.MOVIE_PATH; //アップロードする動画ファイル名

        //テキストファイルはスキップ
        if(fileName.indexOf('.txt') != -1) return;

        const fileSize = fs.statSync(fileName).size;
        const uploadedVideo = await youtube.videos.insert(
            {
              part: 'id,snippet,status',
              notifySubscribers: false,
              requestBody: {
                snippet: {
                  title: params.title,
                  description: params.description,
                },
                status: {
                  privacyStatus: params.status,
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
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(`${Math.round(progress)}% complete`);
              },
            }
          );
          console.log('\n\n');
          console.log(uploadedVideo.data);

          //非公開作業リストに追加
          const params = {
            part: 'id,snippet,contentDetails',
            requestBody: {
              snippet: {
                playlistId: 'PLeVbfCYWrCE2AmrGkEU8L3QmERR7PuP-a',
                position: 0,
                resourceId: {
                  videoId: uploadedVideo.data.id,
                  kind: 'youtube#video'
                },
              },
            }
          }
          const res = await youtube.playlistItems.insert(params);
          console.log(res.data);
          
          return uploadedVideo.data;
          // return res.data;

    } catch (error) {
        console.log('The API returned an error: ' + error);
    }
}

module.exports = youtubeUpload;