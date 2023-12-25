
const fs = require('fs');

//Google Driveからファイルをダウンロードする
async function dlFile(drive, file, DLPATH) {
    let progress = 0;
    // const drive = google.drive({version: 'v3', auth});
    let mimeType = file.mimeType.split('/')[1];
    if(mimeType === `plain`) mimeType = `txt`;
    const dlFileName = `${file.name}.${mimeType}`;
    const dest = fs.createWriteStream(`${DLPATH}/${dlFileName}`, 'utf8');

    const res = await drive.files.get({fileId: file.id, alt: 'media'}, {responseType: 'stream'});
    return new Promise((resolve, reject) => {
        res.data.on('data', chunk => {
            dest.write(chunk);
            progress += chunk.length;
            if (process.stdout.isTTY) {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(`Downloaded ${Math.round(progress / 10000) / 100} MB`);
            }
        });
        res.data.on('end', () => resolve({end: dest.end(), dlFileName: dlFileName})); //保存完了
        res.data.on('error', err => reject(err));   
    });

}

module.exports = dlFile;