'use strict';

const {google} = require('googleapis');
const tokenAuth = require('./tokenAuth');

const getClassRooms = async () => {
    const auth = tokenAuth(process.env.G_SHEET_N0BI_CREDENTIALS, process.env.G_SHEET_N0BI_TOKEN);
    const sheets = google.sheets({version: 'v4', auth});

    try {
      const res = await sheets.spreadsheets.values.get({
          spreadsheetId: '1yoebS5VHq9rgSzq-B_8toRZgW9GHcItJ3mKmh4ZxdmA',
          range: 'RoomList!A:F',
      });

      const values = res.data.values;

      const keyList = res.data.values[0];
      const nameRow = keyList.indexOf('NAME'); //おそらく5番目
      const roomName = '授業部屋';

      //授業部屋とつく名前のルーム
      const rooms = values.filter(roomInfo => roomInfo[nameRow] && roomInfo[nameRow].indexOf(roomName) != -1);

      // console.log(rooms);

      return rooms;

    } catch (error) {
        console.log('The API returned an error: ' + error);
    }
}

module.exports = getClassRooms;