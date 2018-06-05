
const GoogleDrive = require('./app/google-drive-api/google-drive');
require('dotenv').config();

const googleDrive = new GoogleDrive();

googleDrive.createCredential().then(
    async (success) => {
        const mode = await googleDrive.choiceMode();
        console.log(mode);

        if(mode == "1" || mode == "2")
            await googleDrive.getData();
        if(mode == "1" || mode == "3")
            await googleDrive.downloadURLs();
    },
    (err) => console.log(err));