require('dotenv').config();

const mysql = require('mysql2/promise');

const mysqlPromise = mysql.createPool({
    host: process.env.MYSQL_SERVER,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

// const mysqlPromise = mysql.createPool({
//     host: '127.0.0.1',
//     port: 3307,
//     user: 'root',
//     password: '',
//     database: 'test_database'
// });

// Test database connection
mysqlPromise.getConnection()

.then(connection => {
    console.log('✅ Connected to MariaDB successfully!');
    connection.release();
})
.catch(error => {
    console.error('❌ MariaDB connection failed:', error.message);
});

module.exports = { mysql, mysqlPromise };