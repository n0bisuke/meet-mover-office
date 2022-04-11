'use strict'

async function createFolder(drive, file, DESTINATION_FOLDER_ID){
    const newFolderName = file.meetId;
    console.log(file);

    //バックアップフォルダをチェック
    const params = {
      q: `'${DESTINATION_FOLDER_ID}' in parents and trashed = false`,
    }
    const res = await drive.files.list(params);

    const exists = res.data.files.find(destination_file => destination_file.name === newFolderName);

    if(exists) {
      console.log(`${newFolderName}は存在します。`);
    }else{
      console.log(`${newFolderName}は存在しません。`);
      console.log(`フォルダを新規作成します。`);
      const params = {
        fields: 'id',
        requestBody: {
          parents: [DESTINATION_FOLDER_ID],
          name: newFolderName,
          mimeType: 'application/vnd.google-apps.folder'
        }
      }

      return await drive.files.create(params);
    }
}

module.exports = createFolder;
