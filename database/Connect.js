const knex = require('knex');
require('dotenv').config();

let Connect = knex({
    client: 'mysql2',
    connection: {
        host :process.env.DATABASE_CONNECTION,
        user : process.env.DATABASE_USER,
        port: process.env.DATABASE_PORT,
        password : process.env.DATABASE_PASSWORD,
        database : process.env.DATABASE_DATABASE,
        timezone: process.env.DATABASE_TZ
    }
});


module.exports = Connect