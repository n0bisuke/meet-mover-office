'use strict';

require('dotenv').config();

console.log(`--setup--`);
console.log(process.env.ORIGIN_FOLDER_ID);

const fs = require('fs');

const Gdrive = require('./libs/gdrive/'); // Class;

const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER;
const tokenStr = process.env.G_TOKEN_OFFICE;
const ORIGIN_FOLDER_ID = process.env.ORIGIN_FOLDER_ID; //ここにフォルダIDを指定
const DESTINATION_FOLDER_ID = process.env.DESTINATION_FOLDER_ID;

const gdrive = new Gdrive(credentialsStr, tokenStr, ORIGIN_FOLDER_ID, DESTINATION_FOLDER_ID);

const DL_FOLDER_NAME = './dl';

const ytUpload = require('./libs/ytUpload');
const getClassRooms = require('./libs/getClassRooms');

console.log(`--setup done--`);

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
    // console.log(classRooms);

    if(classRooms.length){
      const CLASS_NAME = classRooms[0][1].split('授業部屋')[0]; //title用
      console.log(`授業動画です。`);
      ytUploadTitle = `${CLASS_NAME} - ${file.name}`
      type = 'school';
    }

    const params = {
      MOVIE_PATH: `${DL_FOLDER_NAME}/${file.name}.mp4`,
      title: `${ytUploadTitle}`,
      channel: type,
      status: 'private',
      description: meetChatText,
    }
    console.log(`Uploading for ${type} Youtube...`);
    await ytUpload(params);

    // 4. localファイル削除
    console.log(`local file deleting...`)
    fs.unlinkSync(`${DL_FOLDER_NAME}/${file.name}.mp4`);
    // console.log(`${DL_FOLDER_NAME}/${file.name}.mp4`);

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
  // 1. MEETフォルダのファイルリストを取得
  const files = await gdrive.list();
  // console.log(files);
  
  //フォルダ作成 
  try {
    console.log(`フォルダ作成...`);
    fs.mkdirSync(DL_FOLDER_NAME);  
  } catch (error) {
    console.log(`--既にフォルダがあった模様--`);
  }

  // リスト分を処理
  try {


    for await (const file of files) {
      console.log(`start...`);      

      if(file.mimeType === 'video/mp4') {
        console.log(`YT upload...`);
        await _gdrive2youtube(file);
        console.log(`YT done, gdrive move...`);
      }
      
      //Meet Recordingsフォルダから移動
      await gdrive.move(file);
      console.log(`---done----`);
    }
    
    fs.rmdirSync(DL_FOLDER_NAME); //フォルダ削除
  } catch (error) {
    console.log(error);
  }
}

main().catch(console.error);
