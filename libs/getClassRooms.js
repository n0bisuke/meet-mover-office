'use strict';

const {google} = require('googleapis');
const tokenAuth = require('./tokenAuth');

const MEET_SHEET_ID = process.env.MEET_SHEET_ID;

const getClassRooms = async (meetId) => {
    // console.log(`???`, meetId, '???')
    const auth = tokenAuth(process.env.G_SHEET_NB_CREDENTIALS, process.env.G_SHEET_NB_TOKEN);
    const sheets = google.sheets({version: 'v4', auth});

    try {
      const res = await sheets.spreadsheets.values.get({
          spreadsheetId: MEET_SHEET_ID,
          range: 'RoomList!A:F',
      });

      const values = res.data.values;

      const keyList = res.data.values[0];
      const nameRow = keyList.indexOf('NAME'); //おそらく5番目
      const roomName = '授業部屋';

      //授業部屋とつく名前のルーム
      const rooms = values.filter(roomInfo => roomInfo[nameRow] && roomInfo[nameRow].indexOf(roomName) != -1);
      // console.log(rooms);    
      const roomInfo = rooms.filter(room => room[2].indexOf(meetId) != -1);
      //console.log(roomInfo, '////');
      return roomInfo;

    } catch (error) {
        console.log('The API returned an error: ' + error);
    }
}

module.exports = getClassRooms;