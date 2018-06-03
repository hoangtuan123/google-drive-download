const MySQLConnector = require('../sql-helper/sql-connecter');

class DownloadLink{
    
    constructor(){
        this.mysqlConnector = new MySQLConnector();
        this.mysqlConnector.openConnect();
    }

    async createTable(){
        return await this.mysqlConnector.sqlExcute(`
            CREATE TABLE IF NOT EXISTS download_link 
            (
                id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
                drive_id nvarchar(255),
                drive_name NVARCHAR(255),
                drive_download_url text,
                drive_parent_id NVARCHAR(255),
                drive_parent_name NVARCHAR(255),
                status nvarchar(255),
                drive_length_file nvarchar(255)
            )
        `);
    }

    async insert(data){
        return await this.mysqlConnector.sqlExcute(`
            INSERT INTO download_link
            (
                drive_id, drive_name, drive_download_url, drive_parent_id, drive_parent_name, drive_length_file
            )
            VALUES
            (
                '${ data.drive_id }', '${data.drive_name}', '${data.drive_download_url}', '${data.drive_parent_id}', '${data.drive_parent_name}', '${data.drive_length_file}'
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
            select id, drive_id, drive_name, drive_download_url, drive_parent_id, drive_parent_name, drive_length_file
            from download_link where status is null
        `)
    }
}

module.exports = DownloadLink;

