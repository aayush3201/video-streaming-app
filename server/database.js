const mysql = require('mysql');
require('dotenv').config();

const initConnection = () => {
    return mysql.createConnection({
        host: process.env.DATABASE_ENDPOINT,
        user: process.env.DATABASE_USERNAME,
        password: process.env.PASSWORD
    });
}


//Initialize the database, creating a database and tables if they do not already exist
const initDB = () => {
    const con = initConnection()
    con.connect(function(err) {
        if (err) throw err;
    
        con.query('CREATE DATABASE IF NOT EXISTS main;');
        con.query('USE main;');
        con.query('CREATE TABLE IF NOT EXISTS videos(id varchar(120), name varchar(120), description mediumtext, PRIMARY KEY(id));', function(error, result, fields) {
            console.log(result);
        });
        con.end();
    });
}

const addVideo = ({id,name,description}) => {
    const con = initConnection();
    return new Promise((resolve,reject)=>{
        con.connect(function(err) {
            if (err) throw err;
            con.query(`INSERT INTO main.videos (id,name,description) VALUES ('${id}','${name}','${description}');`, function(error, result, fields) {
                if(error) {
                    console.log(error);
                    reject();
                }
                if(result){
                    resolve();
                }
            });
            con.end();
        });
    })
}

const getAllVideos = () => {
    const con = initConnection();
    return new Promise((resolve,reject)=>{
        con.connect(function(err) {
            if (err) throw err;
            con.query(`SELECT * FROM main.videos`, function(error, result, fields) {
                if(error) {
                    console.log(error);
                    reject();
                }
                if(result){
                    resolve(result);
                }
            });
            con.end();
        });
    })
}

/* Functions for dev purposes */

const deleteTable = (tableName) => {
    const con = initConnection();
    con.connect(function(err) {
        if (err) throw err;
        con.query(`DROP TABLE IF EXISTS main.${tableName};`, function(error, result, fields) {
            console.log(result);
        });
        con.end();
    });
}

const showTables = () => {
    const con = initConnection();
    con.connect(function(err) {
        if (err) throw err;
        con.query(`SHOW TABLES;`, function(error, result, fields) {
            console.log(result);
        });
        con.end();
    });
}

const clearTable = () => {
    const con = initConnection();
    con.connect(function(err) {
        if (err) throw err;
        con.query(`DELETE FROM main.videos`, function(error, result, fields) {
            console.log(result);
        });
        con.end();
    });
}


// Add all exports here!
module.exports = {initDB,deleteTable,showTables,addVideo,getAllVideos,clearTable};