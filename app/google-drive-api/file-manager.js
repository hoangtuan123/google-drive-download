const fs = require('fs');

class FileManager {

    constructor() { }

    async readFile(path) {
        return new Promise((reslove, reject) => {
            fs.readFile(path, (err, content) => {
                if (err)
                    reslove(false);
                else
                    reslove(content);
            });
        })
    }

    async writeFile(path, data) {
        return new Promise((reslove, reject) => {
            fs.writeFile(path, data, (err) => {
                if (err)
                    reject(err);
                else
                    reslove(path);
            });
        });
    }

}

module.exports = FileManager;