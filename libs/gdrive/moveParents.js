'use strict'

async function moveParents(drive, file, targetFolderId, MOVED_DRIVE_ID){
    try {
        const params = {
            fileId: file.id,
            driveId: MOVED_DRIVE_ID,
            corpora: 'drive',
            includeItemsFromAllDrives: true,
            supportsTeamDrives: true,
    
            addParents: targetFolderId, //試してないけど配列指定で複数の場所から参照できそう
        };
    
        return await drive.files.update(params);        
    } catch (error) {
        console.log(error, `移動失敗`)
    }

}

module.exports = moveParents;
