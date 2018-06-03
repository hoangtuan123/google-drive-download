const FileManager = require('./file-manager');

const readline = require('readline');
const { google } = require('googleapis');


// kind of link
const GOOGLE_DRIVE_CHILD_LIST = "drive#childList";
const GOOGLE_DIRVE_FILE = "drive#file";

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'credentials.json';
const CLIENT_SERECT = 'client_secret.json';
const PATH = './videos';

class AuthGoogle {

    constructor() {
        this.fileManger = new FileManager();
    }

    async getCredential() {
        return await this.fileManger.readFile(CLIENT_SERECT);
    }

    async getAuthorize(credentials) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        let token = await this.fileManger.readFile(TOKEN_PATH);

        if (!token)
            token = await this.getAccessToken(oAuth2Client);

        oAuth2Client.setCredentials(JSON.parse(token));

        return oAuth2Client;
    }

    async getAccessToken(oAuth2Client) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Authorize this app by visiting this url:', authUrl);
        const question = 'Enter the code from that page here: ';
        const code = await this.readLine(question);
        const token = await this.getToken(code, oAuth2Client);
        const tokenPath = await this.fileManger.writeFile(TOKEN_PATH, JSON.stringify(token));

        return token;
    }

    async getToken(code, oAuth2Client) {
        return new Promise((resolve, reject) => {
            oAuth2Client.getToken(code, (err, token) => {
                if (err)
                    reject(err);
                else
                    resolve(token);
            });
        });
    }

    async readLine(text) {
        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question(text, (code) => {
                rl.close();
                resolve(code);
            });
        });
    }
}

module.exports = AuthGoogle;