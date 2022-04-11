'use strict'

async function createFolder(drive, file, DESTINATION_FOLDER_ID){
    const newFolderName = file.meetId;
    //バックアップフォルダをチェック
    const params = {
      q: `'${DESTINATION_FOLDER_ID}' in parents and trashed = false`,
    }
    const res = await drive.files.list(params);

    const exists = res.data.files.find(destination_file => destination_file.name === newFolderName);
    
    let folderId = '';
    if(exists && res.data.files[0].mimeType === 'application/vnd.google-apps.folder') {
      console.log(`${newFolderName}は存在します。`);
      folderId = res.data.files[0].id; //フォルダーIDを取得
    }else{
      console.log(`${newFolderName}は存在しません。フォルダを新規作成します。`);

      const params = {
        fields: 'id',
        requestBody: {
          parents: [DESTINATION_FOLDER_ID],
          name: newFolderName,
          mimeType: 'application/vnd.google-apps.folder'
        }
      }

      const newFolder = await drive.files.create(params);
      folderId = newFolder.data.id;
    }

    return folderId;
}

module.exports = createFolder;
