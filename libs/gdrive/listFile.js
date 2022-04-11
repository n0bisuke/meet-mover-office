'use strict';

module.exports = async (drive, FOLDER_ID) => {
    const params = {q: `'${FOLDER_ID}' in parents and trashed = false`}; 
    const res = await drive.files.list(params);
    let files = res.data.files;
    // console.log(res.data);

    let fileList = [];
    for (let i = 0, len = files.length; i < len; i++) {
        if(files[i].mimeType === 'application/vnd.google-apps.folder') continue;
        const meetId = files[i].name.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/)[0];
        files[i].meetId = meetId;
    }

    return files;
}