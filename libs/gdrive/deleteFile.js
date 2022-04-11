async function deleteFile(drive, file){
    const params = {fileId: file.id};

    try {
        const res = await drive.files.delete(params);
        return res;
    } catch (error) {
        return error;   
    }
}

module.exports = deleteFile;