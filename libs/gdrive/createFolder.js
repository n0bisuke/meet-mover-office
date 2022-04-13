'use strict'

async function createFolder(drive, file, DESTINATION_FOLDER_ID){
    const newFolderName = file.meetId;
    //バックアップフォルダをチェック
    const params = {
      driveId: DESTINATION_FOLDER_ID,
      corpora: 'drive',
      includeItemsFromAllDrives: true,
      supportsTeamDrives: true,
      q: `'${DESTINATION_FOLDER_ID}' in parents and trashed = false`,
    }
    const res = await drive.files.list(params);
    const exists = res.data.files.find(destination_file => destination_file.name.indexOf(newFolderName) != -1);

    // console.log(`${newFolderName}は...`);
    let folderId = '';

    if(exists && exists.mimeType === 'application/vnd.google-apps.folder') {
      console.log(`存在します。`);
      folderId = exists.id; //フォルダーIDを取得
    }else{
      console.log(`存在しません。フォルダを新規作成します。`);

      const params = {
        driveId: DESTINATION_FOLDER_ID,
        corpora: 'drive',
        includeItemsFromAllDrives: true,
        supportsTeamDrives: true,
        
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
