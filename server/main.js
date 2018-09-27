// Step 1 - Load libraries
const path = require('path');
const express = require('express');
const mysql = require("mysql");
const bodyParser = require("body-parser");

// Step 2 - Create instance of Express
const app = express();

//Configure a connection pool to the database
console.log("process.env.DB_PORT => ",process.env.DB_PORT);

const sqlFindAllCustomers = "SELECT * FROM customer limit 1";


const pool = mysql.createPool({
    host: process.env.DB_HOST, //"localhost",
    port: process.env.DB_PORT, //3306,
    user: process.env.DB_USER, //"root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, //"derby",
    connectionLimit: process.env.DB_CONLIMIT //4
    // debug: true
});

var makeQuery = (sql, pool)=>{
    console.log(sql);
    
    return  (args)=>{
        let queryPromsie = new Promise((resolve, reject)=>{
            pool.getConnection((err, connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                console.log(args);
                
                connection.query(sql, args || [], (err, results)=>{
                    connection.release();
                    if(err){
                        reject(err);
                        return;
                    }
                    console.log(">>> "+ results);
                    resolve(results); 
                })
            });
        });
        return queryPromsie;
    }
}

var findAllCustomers = makeQuery(sqlFindAllCustomers, pool);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Step 3: define routes
//GET UUID
app.get('/customer',(req, resp) =>{
    console.log("/customer");
   // resp.status(200);
    //resp.json({name:"fred"});

    findAllCustomers().then((results)=>{
        resp.json(results);
    }).catch((error)=>{
        console.log(error);
        resp.status(500).json(error);
    });
});

// Step 4 - assign port and Start Server
const PORT = parseInt(process.argv[2]) || 
           parseInt(process.env.APP_PORT) || 3000;
app.listen(PORT, () => {
   console.info(`App started on port ${PORT} at ${new Date()}`);
});