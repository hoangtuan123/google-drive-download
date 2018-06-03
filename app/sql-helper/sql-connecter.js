const mysql = require('mysql');

class MySqlConnecter{

    constructor(){
        this.con = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB,
        });
    }

    async openConnect(){
        return new Promise((resolve, reject) =>{
            this.con.connect(function (err) {
                if (err)
                    reject(err);
                else 
                    resolve(true);
            });
        })
    }

    async sqlExcute(sql){
        console.log('query: ', sql);
        return new Promise((resolve, reject) =>{
            this.con.query(sql, function(err, result){
                if(err)
                    reject(err);
                else
                    resolve(result); 
            });
        })
    }

}

module.exports = MySqlConnecter;