
const GoogleDrive = require('./app/google-drive-api/google-drive');
require('dotenv').config();

const googleDrive = new GoogleDrive();

googleDrive.createCredential().then(
    async (success) => {
        await googleDrive.getData();
        await googleDrive.downloadURLs();
        //await googleDrive.getAllFileByFolderId();
    },
    (err) => console.log(err));
//