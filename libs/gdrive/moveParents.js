'use strict'

async function moveParents(drive, file, targetFolderId){
    const params = {
        fileId: file.id,
        addParents: targetFolderId, //試してないけど配列指定で複数の場所から参照できそう
    };

    return await drive.files.update(params);
}

module.exports = moveParents;
