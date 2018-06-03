const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
var readline = require('readline');

class DownloadFile {
    constructor() {

    }

    async donwloadGoogleDrive(fileId, filePath, auth, drive_length_file) {
        if(fs.existsSync(filePath))
            return true;
        return new Promise(async (resolve, reject) => {
            const drive = google.drive({
                version: 'v3',
                auth: auth
            });
            const file = fs.createWriteStream(filePath);
            let progress = 0;

            drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' }, (err, res) => {
                    if (err) reject(err);

                    res.data.on('end', () => {
                        console.log('download done');
                        resolve(filePath);
                    }).on('error', err => {
                        console.log('err:', err);
                        reject(err);
                    }).on('data', d => {
                        progress += d.length;
                        console.log(`Downloaded ${Math.floor(progress / parseInt(drive_length_file) * 100)} %`);
                    }).pipe(file);
                }
            );

        });
    }

    async createFolder(dir) {
        if (!fs.existsSync(dir))
            return fs.mkdirSync(dir);
        else return false;
    }

    async createFolderWithinSub(dir){
        const dirs = dir.split('/');
        console.log(dirs);
        let folder = '';
        for(const item of dirs){
            folder+= item + '/';
            console.log(folder);
            if(item != '.')
                await this.createFolder(folder);
        }
        return true;
    }

}

module.exports = DownloadFile;