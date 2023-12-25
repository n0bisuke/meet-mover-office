'use strict'

async function createFolder(drive, file, MOVED_DRIVE_ID, MOVED_FOLDER_ID){
    const newFolderName = file.meetId;
    //バックアップフォルダをチェック
    const params = {
      driveId: MOVED_DRIVE_ID,
      corpora: 'drive',
      includeItemsFromAllDrives: true,
      supportsTeamDrives: true,
      q: `'${MOVED_FOLDER_ID}' in parents and trashed = false`, //フォルダ内のファイルを検索
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
        driveId: MOVED_DRIVE_ID,
        corpora: 'drive',
        includeItemsFromAllDrives: true,
        supportsTeamDrives: true,
        
        fields: 'id',
        requestBody: {
          parents: [MOVED_FOLDER_ID],
          name: newFolderName,
          mimeType: 'application/vnd.google-apps.folder'
        }
      }

      const newFolder = await drive.files.create(params);
      // console.log(`作成done: `, newFolder);
      folderId = newFolder.data.id;
      console.log(`新規フォルダー作成done`);
    }

    return folderId;
}

module.exports = createFolder;
