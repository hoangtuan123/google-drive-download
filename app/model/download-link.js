const MySQLConnector = require('../sql-helper/sql-connecter');

class DownloadLink{
    
    constructor(){
        this.mysqlConnector = new MySQLConnector();
        //this.mysqlConnector.openConnect();
    }

    async createTable(){
        return await this.mysqlConnector.sqlExcute(`
            CREATE TABLE IF NOT EXISTS download_link 
            (
                id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
                drive_id nvarchar(255),
                drive_mime_type NVARCHAR(255),
                drive_title nvarchar(255),
                drive_path NVARCHAR(1000),
                drive_file_size int,
                status nvarchar(255)
            )
        `);
    }

    async insert(data){
        return await this.mysqlConnector.sqlExcute(`
            INSERT INTO download_link
            (
                drive_id, drive_mime_type, drive_title, drive_path, drive_file_size
            )
            VALUES
            (
                '${ data.drive_id }', '${data.drive_mime_type}', '${data.drive_title}', '${data.drive_path}', '${ data.drive_file_size }'
            )
        `);
    }

    async updateStatus(id){
        return await this.mysqlConnector.sqlExcute(`
            UPDATE download_link set status ='done' where id = ${id}
        `);
    }

    async get(){
        return await this.mysqlConnector.sqlExcute(`
            select *
            from download_link where status is null
        `)
    }
}

module.exports = DownloadLink;

