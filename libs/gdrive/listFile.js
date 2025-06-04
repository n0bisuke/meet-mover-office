'use strict';

//MeetのIDっぽいファイルを探す
module.exports = async (drive, FOLDER_ID) => {
    const params = {q: `'${FOLDER_ID}' in parents and trashed = false`}; 
    const res = await drive.files.list(params);
    let files = res.data.files;

    console.log(`Found ${files.length} files in folder`);

    for (let i = 0, len = files.length; i < len; i++) {
        if(files[i].mimeType === 'application/vnd.google-apps.folder') {
            console.log(`Skipping folder: ${files[i].name}`);
            continue;
        }
        
        console.log(`Processing file: ${files[i].name}`);
        
        // Meet IDの正規表現マッチを安全に処理
        const meetIdMatch = files[i].name.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/);
        
        if (meetIdMatch) {
            files[i].meetId = meetIdMatch[0];
            console.log(`  Meet ID found: ${files[i].meetId}`);
        } else {
            console.log(`  No Meet ID pattern found in: ${files[i].name}`);
            files[i].meetId = null; // または適切なデフォルト値
        }
    }

    return files;
}