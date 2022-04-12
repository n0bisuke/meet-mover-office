'use strict'

async function moveParents(drive, file, targetFolderId, DESTINATION_FOLDER_ID){
    const params = {
        fileId: file.id,
        driveId: DESTINATION_FOLDER_ID,
        corpora: 'drive',
        includeItemsFromAllDrives: true,
        supportsTeamDrives: true,

        addParents: targetFolderId, //試してないけど配列指定で複数の場所から参照できそう
    };

    return await drive.files.update(params);
}

module.exports = moveParents;
