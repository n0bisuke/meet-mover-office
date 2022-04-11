'use strict';

const {google} = require('googleapis');
const fs = require('fs');

const dlFile = require('./dlFile');
const deleteFile = require('./deleteFile');
const listFile = require('./listFile');
const tokenAuth = require('../tokenAuth');
const findFile = require('./findFile');
const createFolder = require('./createFolder');
const moveParents = require('./moveParents');

class Gdrive {
    constructor(credentialsStr, tokenStr, ORIGIN_FOLDER_ID, DESTINATION_FOLDER_ID) {
        this.drive = google.drive({
            version: 'v3',
            auth: tokenAuth(credentialsStr, tokenStr)
        });

        this.docs = google.docs({
            version: 'v1',
            auth: tokenAuth(credentialsStr, tokenStr)
        });

        this.DESTINATION_FOLDER_ID = DESTINATION_FOLDER_ID;
        this.ORIGIN_FOLDER_ID = ORIGIN_FOLDER_ID;
        this.DL_FOLDER_NAME = './dl';
    }
 
    async list(FOLDER_ID = this.ORIGIN_FOLDER_ID){
        try {
            return await listFile(this.drive, FOLDER_ID);
        } catch (error) {
            throw new Error(error);
        }
    }

    async dlFile(file, DL_FOLDER_NAME = this.DL_FOLDER_NAME){
        try {
            return await dlFile(this.drive, file, DL_FOLDER_NAME);
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteFile(file){
        try {
            return await deleteFile(this.drive, file);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getMeetChat(file, FOLDER_ID = this.ORIGIN_FOLDER_ID, DL_FOLDER_NAME = this.DL_FOLDER_NAME){
        try {
            const chatFile = await findFile(this.drive, file, FOLDER_ID);
            let ytInsertText = 'Meetチャット無し';

            //チャットファイルがあればDL
            if(chatFile?.id){
                const { dlFileName } = await this.dlFile(chatFile, DL_FOLDER_NAME);
                const meetChat = fs.readFileSync(`${DL_FOLDER_NAME}/${dlFileName}`, 'utf8');
                
                //Youtubeの概要欄が5000文字までっぽいので、4900文字までで切り取っておく。
                ytInsertText = meetChat;
                if(meetChat.length > 4900){
                    ytInsertText = meetChat.slice(0, 4900);
                }
                //削除
                fs.unlinkSync(`${DL_FOLDER_NAME}/${dlFileName}`);
            }

            return ytInsertText;
        } catch (error) {
            throw new Error(error);
        }
    }

    async move(file, DESTINATION_FOLDER_ID = this.DESTINATION_FOLDER_ID){
        try {
            const folderId = await createFolder(this.drive, file, DESTINATION_FOLDER_ID);
            // console.log(folderId);
            return await moveParents(this.drive, file, folderId);
        } catch (error) {
            throw new Error(error);
        }
    }
}
  
module.exports = Gdrive;