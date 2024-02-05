// Google Driveからファイルをダウンロードする
async function dlFile(drive, file, DLPATH) {
    let progress = 0;
    let mimeType = file.mimeType.split('/')[1];
    if (mimeType === `plain`) mimeType = `txt`;
    const dlFileName = `${file.name}.${mimeType}`;
    const dest = Bun.file(`${DLPATH}/${dlFileName}`, 'w');
    const writer = dest.writer();
    const res = await drive.files.get({fileId: file.id, alt: 'media'}, {responseType: 'stream'});

    const start = performance.now();
    // 実行時間を計測した処理

    return new Promise((resolve, reject) => {
        res.data.on('data', chunk => {
//             Bun.write(dest, chunk);
//             const file = Bun.file("output.txt");
// const writer = file.writer();
                writer.write(chunk);
                // writer.flush();
            progress += chunk.length;
            if (process.stdout.isTTY) {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(`(use Bun.write)Downloaded ${Math.round(progress / 10000) / 100} MB`);
            }
        });
        res.data.on('end', () => {
            writer.flush();
            writer.end();
            // Bun.close(dest);
            
            const end = performance.now();
            console.log(`DL=>ファイル書き込み時間: ${(end - start) / 1000} sec`);

            resolve({ dlFileName: dlFileName });
        });
        res.data.on('error', err => {
            Bun.close(dest);
            reject(err);
        });
    });
}

module.exports = dlFile;
