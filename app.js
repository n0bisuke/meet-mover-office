'use strict';

const fs = require('node:fs');

const DL_FOLDER_NAME = './dl';

//ログ用途
const LOGFILE_NAME = `log.json`;

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

console.log(`--setup--`);

const Gdrive = require('./libs/gdrive/'); // Class;

const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER;
const tokenStr = process.env.G_TOKEN_OFFICE;
const ORIGIN_MEET_REC_FOLDER_ID = process.env.ORIGIN_MEET_REC_FOLDER_ID; //ここにフォルダIDを指定
const MOVED_DRIVE_ID = process.env.MOVED_DRIVE_ID;

const gdrive = new Gdrive(credentialsStr, tokenStr, ORIGIN_MEET_REC_FOLDER_ID, MOVED_DRIVE_ID);

const ytUpload = require('./libs/ytUpload');
const getClassRooms = require('./libs/getClassRooms');

console.log(`--setup done--`);



// const main = async () => {
//   // 1. MEETフォルダのファイルリストを取得
//   const files = await gdrive.list();
//   console.log(files);
  
//   // リスト分を処理
//   try {
//     for await (const file of files) {
//       if(file.mimeType === `application/vnd.google-apps.folder`) {
//         console.log(`フォルダーなのでスキップします。`)
//         continue;
//       }

//       console.log(`処理start...`);
//       //Meet Recordingsフォルダから移動
//       await gdrive.move(file);
//       console.log(`...処理終わり`);
//     }

//     console.log(`----All DONE----`)
//   } catch (error) {
//     console.log(error);
//   }
// }

//Youtubeにアップロード
const _gdrive2youtube = async (file) => {
  
  try {
    // 1. Meetのチャットログ取得
    console.log(`find...`);
    const meetChatText = await gdrive.getMeetChat(file);

    // 2. ファイルをダウンロード
    // console.log(`downloading ${file.name}`);
    console.log(`downloading...`);
    await gdrive.dlFile(file, DL_FOLDER_NAME);

    // 3. Youtubeにアップロード
    let type = 'backup';

    // console.log(`uploading ${file.name}`);
    console.log(`uploading...`);
    let ytUploadTitle = file.name;
    // console.log(`--::${file.meetId}`)
    const classRooms = await getClassRooms(file.meetId);

    if(classRooms.length){
      const CLASS_NAME = classRooms[0][1].split('授業部屋')[0]; //title用
      console.log(`授業動画です。`);
      ytUploadTitle = `${CLASS_NAME} - ${file.name}`
      type = 'school';
    }

    const uploadOptions = {
      MOVIE_PATH: `${DL_FOLDER_NAME}/${file.name}.mp4`,
      title: `${ytUploadTitle}`,
      channel: type,
      status: 'private',
      description: meetChatText,
    }
    console.log(`Uploading for ${type} Youtube...`);

    const ytResult = await ytUpload(uploadOptions);

    // 4. localファイル削除
    console.log(`local file deleting...`)
    fs.unlinkSync(`${DL_FOLDER_NAME}/${file.name}.mp4`);
    // console.log(`${DL_FOLDER_NAME}/${file.name}.mp4`);

    // YouTube動画のアップロード完了ステータス
    // if(ytResult?.type != undefined && ytResult?.type === ){
    // }
    return ytResult;

  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}


// const _gdriveMove = async (file) => {
//   try {
//     return await gdrive.move(file);
//   } catch (error) {
//     throw new Error(error);
//   }

//     // 4. ファイルを削除
//     // console.log(`deleting ${file.name}`);
//     // const res = await gdrive.deleteFile(file);
//     // console.log(res);
// }

const main = async () => {
  // 1. Meet Recordingsフォルダから、録画したての録画ファイルのリストを取得
  const files = await gdrive.list();
  // console.log(files);

  // 2. ローカルでDLフォルダ作成 - DLの下準備
  try {
    console.log(`フォルダ作成...`);
    fs.mkdirSync(DL_FOLDER_NAME);  
  } catch (error) {
    console.log(error)
    console.log(`--既にフォルダがあった模様--`);
  }

  try {
    
    let ytResult = {}; //YouTubeアップロード結果

    for await (const file of files) {
      console.log(`start...`);

      // 3. 1で作ったMeet Recordingsフォルダ内の該当するファイルをYouTubeにアップロード

      if(file.mimeType === 'video/mp4') { //動画ファイルのみ処理
        console.log(`YT upload...`);
        ytResult = await _gdrive2youtube(file);
        console.log(`YT done, gdrive move...`);
      }
      
      // 4. Meet Recordingsフォルダから別のドライブ及び指定フォルダに移動
      // await gdrive.move(file, MOVED_DRIVE_ID, process.env.MOVED_FOLDER_ID);
      if(ytResult?.type === undefined || ytResult?.type !== 'error'){
        await gdrive.move(file); //指定がない場合はドライブのルート(DRIVE_IDとFOLDER_IDが同じ)に移動
        console.log(`Drive移動 done`);
      }else{
        console.log(`Drive移動 skip`);
      }

      console.log(`---done----`);
    }
    
    fs.rmdirSync(DL_FOLDER_NAME); //フォルダ削除

    //ロギング
    const logjson = {
      result: ytResult,
      time: dayjs().tz().format()
    }
    fs.writeFileSync(LOGFILE_NAME, JSON.stringify(logjson));
    console.log(`log done--`);

    if(ytResult?.type === 'error'){
      console.log(`異常終了: ${ytResult.msg}`);
      process.exit(1);
    }

  } catch (error) {
    console.log(error);
  }
}


main().catch(console.error);
