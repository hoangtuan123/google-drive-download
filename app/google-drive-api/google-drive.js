
const { google } = require('googleapis');
const AuthGoogle = require('./auth-google');
const DownloadLinkModel = require('../model/download-link');
const DownloadFile = require('../download-helper/download-file');
const PATH_VIDEO = './videos/'
const FOLDER_ID = '1sP5ARWPaKZXYErLwC8dY3Xx2v-6EWAbC';

class GoogleDrive {
    constructor() {
        this.authGoogle = new AuthGoogle();
        this.downloadLinkModel = new DownloadLinkModel();
        this.downloadFile = new DownloadFile();
        this.path = PATH_VIDEO;
    }

    async createCredential() {
        console.log('init credential');

        const credential = await this.authGoogle.getCredential();
        const auth = await this.authGoogle.getAuthorize(JSON.parse(credential));

        this.auth = auth;
        this.drive = google.drive({ version: 'v2', auth });
        this.downloadLinkModel.createTable();
    }

    async getAllFileByFolderId(){
        var fileId = '1gYTluAt1nn9tdJvNMqpWHVi54HpON9k_';
        const auth = this.auth;
        const drive = google.drive({ version: 'v3', auth });
        drive.files.list({
            includeRemoved: false,
            spaces: 'drive',
            fields: 'nextPageToken, files(id, name, parents, owners, kind )',
            q: `'linuxteamvietnam@myschool.host' in owners and mimeType != 'application/vnd.google-apps.folder'`,
            pageSize: 1000
        }, function (err, res) {
            console.log(res.data);
            // for(var item of res.data.files){
            //     console.log(item);
            // }
        });
    }
    

    async getData() {
        const childrenFolder = await this.getChildrenFolder(FOLDER_ID);

        let files = [];
        console.log('call api google - folder list: 0%');
        let total = childrenFolder.items.length;
        let index = 1;
        for (const item of childrenFolder.items) {

            const childrens = await this.getChildrenFolder(item.id);
            const fileInfo = await this.getFileById(item.id);
            const items = childrens.items.map(x => { x.parent_id = item.id, x.parent_name = fileInfo.title; return x; });
            files = files.concat(childrens.items);

            console.log(`call api google - folder list: ${Math.floor(index / total * 100)}%`);
            index++;
        }

        console.log('call api google - file and insert to db: 0%');
        index = 1;
        total = files.length;
        for (const item of files) {
            const file = await this.getFileById(item.id);
            const data = {
                drive_id: item.id
                , drive_name: file.title
                , drive_download_url: file.downloadUrl
                , drive_parent_id: item.parent_id
                , drive_parent_name: item.parent_name
                , drive_length_file: file.fileSize
            }
            const rs = await this.downloadLinkModel.insert(data);

            console.log(`parent name: ${item.parent_name} - file name: ${file.title} - download link: ${file.downloadUrl}`);
            console.log(`insert to db rs: ${rs}`);
            console.log(`call api google - file and insert to db: ${Math.floor(index / total * 100)}%`);
            index++;
        }
    }

    async downloadURLs(){
        console.log('download urls', FOLDER_ID);
        const folderInfo = await this.getFileById(FOLDER_ID);
        this.path = this.path + '/' + folderInfo.title;
        await this.downloadFile.createFolder(this.path);

        const files = await this.downloadLinkModel.get();
        console.log('file will be download:', files.length);

        const total = files.length;
        let index = 1;
        for(const file of files){
            const folderPath = this.path + '/' + file.drive_parent_name;
            const filePath = folderPath + '/' + file.drive_name;
            await this.downloadFile.createFolder(folderPath);
            const rs = await this.downloadFile.donwloadGoogleDrive(file.drive_id, filePath, this.auth, file.drive_length_file);
            const updateStatus = await this.downloadLinkModel.updateStatus(file.id);
            console.log('download file info', rs);
            console.log(`download file ${ Math.floor(index/total*100) }%`);
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
}

module.exports = GoogleDrive;