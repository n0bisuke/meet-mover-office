const path = require('path');
const {google} = require('googleapis');

const driveAuth = () => {

    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../.private/credentials.json'),
      scopes: [
        // 'https://www.googleapis.com/auth/drive.metadata.readonly',
        `https://www.googleapis.com/auth/drive`,
        `https://www.googleapis.com/auth/drive.file`,
        `https://www.googleapis.com/auth/drive.appdata`
      ],
    });
  
    const drive = google.drive({version: 'v3', auth: auth});
  
    return drive;
  }

  module.exports = driveAuth;