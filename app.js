'use strict';

require('dotenv').config();

console.log(`--setup---`);
console.log(process.env.ORIGIN_FOLDER_ID);

const Gdrive = require('./libs/gdrive/'); // Class;

const credentialsStr = process.env.G_CREDENTIALS_GDRIVE_MOVER2;
const tokenStr = process.env.G_TOKEN_HELLO;
const ORIGIN_FOLDER_ID = process.env.ORIGIN_FOLDER_ID; //ここにフォルダIDを指定
const DESTINATION_DRIVE_ID = process.env.DESTINATION_DRIVE_ID;

const gdrive = new Gdrive(credentialsStr, tokenStr, ORIGIN_FOLDER_ID, DESTINATION_DRIVE_ID);

console.log(`--setup done--`);

const main = async () => {
  // 1. MEETフォルダのファイルリストを取得
  const files = await gdrive.list();
  console.log(files);
  
  // リスト分を処理
  try {
    for await (const file of files) {
      if(file.mimeType === `application/vnd.google-apps.folder`) {
        console.log(`フォルダーなのでスキップします。`)
        continue;
      }

      console.log(`処理start...`);
      //Meet Recordingsフォルダから移動
      await gdrive.move(file);
      console.log(`...処理終わり`);
    }

    console.log(`----All DONE----`)
  } catch (error) {
    console.log(error);
  }
}

main().catch(console.error);
