'use strict';

require('dotenv').config();
const fs = require('fs');

const Gdrive = require('./libs/gdrive/'); // Class;

const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER;
const tokenStr = process.env.G_TOKEN_OFFICE;
const ORIGIN_FOLDER_ID = process.env.ORIGIN_FOLDER_ID; //ここにフォルダIDを指定
const DESTINATION_FOLDER_ID = process.env.DESTINATION_FOLDER_ID;

const gdrive = new Gdrive(credentialsStr, tokenStr, ORIGIN_FOLDER_ID, DESTINATION_FOLDER_ID);

const MEET_SHEET_ID = process.env.MEET_SHEET_ID;

const DL_FOLDER_NAME = './dl';

const yt_upload = require('./libs/yt_upload');

//Youtubeにアップロード
const _gdrive2youtube = async (file, type) => {
  
  try {
    // 1. Meetのチャットログ取得
    console.log(`find...`);
    const meetChatText = await gdrive.getMeetChat(file);

    // 2. ファイルをダウンロード
    console.log(`downloading ${file.name}`);
    await gdrive.dlFile(file, DL_FOLDER_NAME);

    // 3. Youtubeにアップロード
    console.log(`uploading ${file.name}`);

    const params = {
      MOVIE_PATH: `${DL_FOLDER_NAME}/${file.name}.mp4`,
      title: `${file.name}`,
      channel: type,
      status: 'private',
      description: meetChatText,
    }
    await yt_upload(params);

    // 4. localファイル削除
    console.log(`local file deleting...`)
    fs.unlinkSync(`dl/${file.name}.mp4`);
    console.log(`dl/${file.name}.mp4`);

  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

//Meet Recordingsフォルダから移動
const _gdriveMove = async (file) => {
  try {
    return await gdrive.move(file);
  } catch (error) {
    throw new Error(error);
  }

    // 4. ファイルを削除
    // console.log(`deleting ${file.name}`);
    // const res = await gdrive.deleteFile(file);
    // console.log(res);
}

const main = async () => {
  // 1. MEETフォルダのファイルリストを取得
  const files = await gdrive.list();
  // console.log(files);


  // リスト分を処理
  try {
    fs.mkdirSync(DL_FOLDER_NAME); //フォルダ作成      

    for await (const file of files) {
      let type = 'backup';
      if(file.meetId === `kbd-xfnb-nah`) {
        type = 'school';
      }
      // else if(file.meetId === `ukh-puzv-cux`){
      //   type = 'backup';
      // }else{
      //   continue;
      // }
      
      console.log(`YT upload...`);
      if(file.mimeType === 'video/mp4') {
        await _gdrive2youtube(file, type);
        console.log(`YT done, gdrive move...`);
      }

      await _gdriveMove(file);
      console.log(`-------`);
    }
    
    fs.rmdirSync(DL_FOLDER_NAME); //フォルダ削除
  } catch (error) {
    console.log(error);
  }
}

main().catch(console.error);
