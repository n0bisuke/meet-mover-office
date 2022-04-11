'use strict';

module.exports = async (drive, file, FOLDER_ID) => {
    const params = {q: `'${FOLDER_ID}' in parents and name = '${file.name}' and mimeType = 'text/plain'`}; 
    const res = await drive.files.list(params);
    let files = res.data.files;
    return files[0];
}