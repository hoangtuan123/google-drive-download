
const { google } = require('googleapis');
const AuthGoogle = require('./auth-google');
const DownloadLinkModel = require('../model/download-link');
const DownloadFile = require('../download-helper/download-file');
const PATH_VIDEO = './videos'
const MIME_TYPE_FOLDER = 'application/vnd.google-apps.folder';

class GoogleDrive {
    constructor() {
        this.authGoogle = new AuthGoogle();
        this.downloadLinkModel = new DownloadLinkModel();
        this.downloadFile = new DownloadFile();
        this.path = PATH_VIDEO;
        this.folderId = "";
    }

    async createCredential() {
        console.log('init credential');

        const credential = await this.authGoogle.getCredential();
        const auth = await this.authGoogle.getAuthorize(JSON.parse(credential));

        this.auth = auth;
        this.drive = google.drive({ version: 'v2', auth });
        this.downloadLinkModel.createTable();
    }

    async choiceMode(){
        console.log('Please choice mode:');
        console.log('1. Find out and download file from google drive');
        console.log('2. Find out file from google drive and insert link to db');
        console.log('3. Download file with link from db');
        return await this.authGoogle.readLine('input key: ');
    }

    async getData() {
        console.log('Please input key of folder:');
        this.folderId = await this.authGoogle.readLine('input key: ');

        if(!this.folderId)
            return false;

        const childrenFolder = await this.getChildrenFolder(this.folderId);

        const files = await this.getAllFileOnFolderByFolderId(this.folderId, this.path);

        console.log('call api google - file and insert to db: 0%');
        let index = 1;
        const total = files.length;
        for (const item of files) {
            const data = {
                drive_id: item.id
                , drive_mime_type: item.mimeType
                , drive_title: item.title
                , drive_path: item.path
                , drive_file_size: item.fileSize
            }
            const rs = await this.downloadLinkModel.insert(data);

            console.log(`insert to db rs: ${rs}`);
            console.log(`call api google - file and insert to db: ${Math.floor(index / total * 100)}%`);
            index++;
        }
    }

    async downloadURLs() {
        const files = await this.downloadLinkModel.get();
        console.log('file will be download:', files.length);

        const total = files.length;
        let index = 1;
        for (const file of files) {
            try {
                const filePath = file.drive_path;
                const folderPath = file.drive_path.replace('/' + file.drive_title, '');
    
                console.log(filePath);
                console.log(folderPath);
    
                const isExistsFolder = await this.downloadFile.createFolderWithinSub(folderPath);
                const rs = await this.downloadFile.donwloadGoogleDrive(file.drive_id, filePath, this.auth, file.drive_file_size);
                const updateStatus = await this.downloadLinkModel.updateStatus(file.id);
                console.log('download file info', rs);
                console.log(`download file ${Math.floor(index / total * 100)}%`);
            } catch (error) {
                console.log('error', error);
                continue;                
            }
            
            index++;
        }

    }

    async getChildrenFolder(folderId) {
        return new Promise((reslove, reject) => {
            this.drive.children.list({
                folderId
            }, (err, { data }) => {
                if (err)
                    reject(err);
                else
                    reslove(data);
            });
        });
    }

    async getFileById(fileId) {
        return new Promise((resolve, reject) => {
            this.drive.files.get({
                fileId
            }, (err, { data }) => {
                if (err)
                    reject(err);
                else
                    resolve(data)
            });
        });
    }

    async getAllFileOnFolderByFolderId(folderId, path) {
        const fileInfo = await this.getFileById(folderId);
        path = path + '/' + fileInfo.title;
        if (fileInfo.mimeType == MIME_TYPE_FOLDER) {
            console.log('found folder', path);
            const rs = [];
            const childrens = await this.getChildrenFolder(folderId);
            for (const children of childrens.items) {
                const childs = await this.getAllFileOnFolderByFolderId(children.id, path);
                childs.forEach(x => rs.push(x));
            }
            return rs;
        }
        console.log('found file', path);
        return [{
            id: fileInfo.id,
            mimeType: fileInfo.mimeType,
            title: fileInfo.title,
            path: path,
            fileSize: fileInfo.fileSize
        }];

    }
}

module.exports = GoogleDrive;