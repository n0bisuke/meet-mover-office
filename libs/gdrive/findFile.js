'use strict';

module.exports = async (drive, file, FOLDER_ID) => {
    let fileName = file.name;
    if(file.name.match(/\.mp4/)) {
        fileName = file.name.split('.mp4')[0];
    }

    const params = {q: `name = '${fileName}' and mimeType = 'text/plain'`}; 
    const res = await drive.files.list(params);
    let files = res.data.files;
    return files[0];
}