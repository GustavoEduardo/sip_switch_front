const knex = require('knex');
require('dotenv').config();
//process.env.DATABASE_CONNECTION
let Connect = knex({
    client: 'mysql2',
    connection: {
        host :"192.168.1.8",
        user : "admin",
        port: 3306,
        password : "admin",
        database :"asteriskcdrdb"
    }
});


module.exports = Connect